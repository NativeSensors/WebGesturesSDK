from eyeGestures.eyegestures import EyeGestures_v1
from datetime import datetime
from celery import Celery
import numpy as np
import hashlib
import logging
import base64
import cv2

class Calibrator:

    def __init__(self):
        self.calibrator = dict()
        pass

    def getItemsNumber(self):
        return len(self.calibrator.keys())

    def get(self, id):
        if id not in self.calibrator.keys():
            return False
        return self.calibrator[id]["calibration"]
        pass

    def create(self,id,monitor):
        if id not in self.calibrator.keys():
            self.calibrator[id] = {
                "calibration": False ,
                "monitor" : monitor ,
                "left"  : 0 ,
                "right" : 0 ,
                "up"    : 0 ,
                "down"  : 0 ,
                "freezed" : False
            }

    def freeze(self,id):
        if id in self.calibrator.keys():
            self.calibrator[id]["freezed"] = True

    def unfreeze(self,id):
        if id in self.calibrator.keys():
            self.calibrator[id]["freezed"] = False

    def remove(self,id):
        if id in self.calibrator.keys():
            del self.calibrator[id]

    def check(self,id,screen_point):
        margin = 5
        width  = self.calibrator[id]["monitor"].width
        height = self.calibrator[id]["monitor"].height
        x = screen_point[0] - self.calibrator[id]["monitor"].x
        y = screen_point[1] - self.calibrator[id]["monitor"].y

        if x <= margin:
            self.calibrator[id]["left"] += 1
        else:
            self.calibrator[id]["left"] = 0
        
        if width - margin <= x:
            self.calibrator[id]["right"] += 1
        else:
            self.calibrator[id]["right"] = 0

        if y <= margin:
            self.calibrator[id]["up"] += 1
        else:
            self.calibrator[id]["up"] = 0
        
        if height - margin <= y:
            self.calibrator[id]["down"] += 1
        else:
            self.calibrator[id]["down"] = 0


        if (self.calibrator[id]["left"] > 20 or 
            self.calibrator[id]["right"] > 20 or
            self.calibrator[id]["up"] > 20 or
            self.calibrator[id]["down"] > 20):
            self.calibrator[id]["left"]  = 0  
            self.calibrator[id]["right"] = 0 
            self.calibrator[id]["up"]    = 0 
            self.calibrator[id]["down"]  = 0
            self.calibrator[id]["calibration"] = True and not self.calibrator[id]["freezed"]
        else:
            self.calibrator[id]["calibration"] = False

class Monitor:

    def __init__(self,width,height,x_offset,y_offset):
        self.width = width
        self.height = height
        self.x = x_offset
        self.y = y_offset

class Client:

    def __init__(self):
        self.calibrator = Calibrator()
        self.gestures   = EyeGestures_v1(roi_width=80,roi_height=30)
        self.max_clients = 8 # each client takes from 0.012s to 0.015s to process
  
    def number(self):
        return self.calibrator.getItemsNumber()

    def process(self,frame,id,display_width,display_height,thresh,radius,offset_x,offset_y):
        frame = cv2.flip(frame, 1)
    
        self.calibrator.create(id,Monitor(display_width,display_height,0,0))
        calibration = self.calibrator.get(id)
        try:
            event, cevent = self.gestures.step(frame,
                                                id, 
                                                calibration, 
                                                display_width, 
                                                display_height,
                                                fixation_freeze = thresh,
                                                freeze_radius = radius,
                                                offset_x = offset_x,
                                                offset_y = offset_y)

        except Exception as e:
            print(f"Exception caught: {e}")
            event = None    

        if event is not None:
            self.calibrator.check(id,event.point)
            return ((event.point[0], event.point[1]),event.fixation,event.blink)
        else:
            return (None,None,None)

    def create(self,id):
        self.calibrator

    def remove(self,id):
        self.calibrator.remove(id)

    def freeze(self,id):
        self.calibrator.freeze(id)

    def unfreeze(self,id):
        self.calibrator.unfreeze(id)

class ClientBuckets:

    def __init__(self):

        self.id2bucket = dict()
        self.clients = []
        self.MAX_BUCKETS = 25

        if len(self.clients) == 0:
            self.clients.append(Client())

    def checkSpace(self,id):
        if id in self.id2bucket.keys():
            return True
        
        if self.clients[len(self.clients) - 1].number() < 9:
            return True
        else:
            if len(self.clients) < self.MAX_BUCKETS:
                return True
        return False
        
    def get(self,id):
        if id not in self.id2bucket.keys():
            if self.clients[len(self.clients) - 1].number() >= self.clients[len(self.clients) - 1].max_clients:
                self.clients.append(Client())
            self.id2bucket[id] = len(self.clients) - 1

        return self.clients[self.id2bucket[id]]

    def remove(self,id):
        if id in self.id2bucket.keys():
            self.clients[self.id2bucket[id]].remove(id)
            del self.id2bucket[id]

            if self.clients[self.id2bucket[id]].number() == 0:
                self.clients.remove(self.clients[self.id2bucket[id]])

        if len(self.clients) == 0:
            self.clients.append(Client())  

    def freeze(self,id):
        self.get(id).freeze(id)

    def unfreeze(self,id):
        self.get(id).unfreeze(id)


def generater_ID():
    AUTH_SIZE = 32
    TIMESTAMP = bytearray(datetime.now().strftime("%m:%d:%Y:%H:%M:%S"),'utf-8')
    WEB_KEY = hashlib.blake2b(digest_size=AUTH_SIZE, key=TIMESTAMP).hexdigest()
    return WEB_KEY

def get_ID(id,user_agent_str,session_id):
    AUTH_SIZE = 32
    ID = hashlib.blake2b(digest_size=AUTH_SIZE, key=bytearray(id,'utf-8'))
    ID.update(bytearray(user_agent_str,'utf-8'))
    ID.update(bytearray(session_id,'utf-8'))
    return ID.hexdigest()

# tasks

# app = Celery('tasks', broker='redis://localhost:6379/0')
sids_to_keys = dict() # backup
buckets = ClientBuckets()

clients2eid = dict()
clients = []

# @app.task
def client_remove(request):   
    try:
        unique_id = sids_to_keys[request.sid]
        buckets.remove(unique_id)
    except Exception as e:
        print(f"Exception: {e}")
    pass
    
# Handle WebSocket connections
# @app.task
def client_create(clientData, request):
    sids_to_keys[request.sid] = clientData["unique_id"]
    pass
    
def client_stop_calibration(clientData, request):
    buckets.freeze(clientData["unique_id"])
    pass

def client_start_calibration(clientData, request):
    buckets.unfreeze(clientData["unique_id"])
    pass

# Handle WebSocket connections
def client_process_data(data):

    logging.info(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")}: Received data: {data}')
    
    unique_id = data["unique_id"]
    if not buckets.checkSpace(unique_id):
        return 

    # Convert base64 image data to OpenCV2 matrix
    image_data = data['image'].split(',')[1]  # Remove data URI header
    image_array = np.frombuffer(base64.b64decode(image_data), dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    logging.debug(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")} [{unique_id}]: processing frame of size {frame.shape}')
    
    # Flip the frame horizontally
    client = buckets.get(unique_id)
    point,fix,blink = client.process(frame,
                                     unique_id,
                                     data["width"],
                                     data["height"],
                                     data["thresh"],
                                     data["radius"],
                                     data["offset_x"],
                                     data["offset_y"])
    
    if point is None:
        return

    payload = { "x" : int(point[0]),"y" : int(point[1]), "fix": fix, "blink" : int(blink), "timestamp": int(data["timestamp"])}
    print(payload)
    return payload