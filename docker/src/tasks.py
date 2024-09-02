from clients import ClientBuckets
from datetime import datetime
from celery import Celery
import numpy as np
import hashlib
import logging
import base64
import cv2

# def generater_ID():
#     AUTH_SIZE = 32
#     TIMESTAMP = bytearray(datetime.now().strftime("%m:%d:%Y:%H:%M:%S"),'utf-8')
#     WEB_KEY = hashlib.blake2b(digest_size=AUTH_SIZE, key=TIMESTAMP).hexdigest()
#     return WEB_KEY

# def get_ID(id,user_agent_str,session_id):
#     AUTH_SIZE = 32
#     ID = hashlib.blake2b(digest_size=AUTH_SIZE, key=bytearray(id,'utf-8'))
#     ID.update(bytearray(user_agent_str,'utf-8'))
#     ID.update(bytearray(session_id,'utf-8'))
#     return ID.hexdigest()
# tasks

app = Celery('tasks', broker='redis://localhost:6379/0')
sids_to_keys = dict() # backup
buckets = ClientBuckets()

clients2eid = dict()
clients = []

@app.task
def client_remove(request):   
    try:
        unique_id = sids_to_keys[request.sid]
        buckets.remove(unique_id)
    except Exception as e:
        print(f"Exception: {e}")
    pass
    
# Handle WebSocket connections
@app.task
def client_create(clientData, request):
    KEY = "unique_id"
    sids_to_keys[request.sid] = clientData[KEY]
    print("=========ADDING CLIENT=========")
    print(f"{request.sid}:{clientData[KEY]}")

# Handle WebSocket connections
@app.task
def client_process_data(frame,data, request, emit, sid):    
    # print(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")}: Received data: {data}')

    if not buckets.checkSpace(data["unique_id"]):
        return

    # Flip the frame horizontally
    try:
        client = buckets.get(data["unique_id"])
        event, calibration = client.process(frame,
                                        data['calibrate'],
                                        data)
        print(event, calibration)
        if event is None:
            emit('rsp', {"x" : 0, "y" : 0, "c_x" : 0, "c_y" : 0})
            return
        # emit('rsp', {"x" : event.point[0],
        #                 "y" : event.point[1],
        #                 "c_x" : calibration.point[0],
        #                 "c_y" : calibration.point[1]})
        payload = {"x" : event.point[0],
                "y" : event.point[1],
                "c_x" : calibration.point[0],
                "c_y" : calibration.point[1]}
        emit('rsp',payload)
    except Exception as e:
        print(f"Failed to process image: {e}")
        emit('rsp', {"x" : 0, "y" : 0, "c_x" : 0, "c_y" : 0})
