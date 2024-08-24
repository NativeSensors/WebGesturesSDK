# flask_app.py
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from eyeGestures.eyegestures import EyeGestures_v2
from threading import Thread 
import numpy as np
import hashlib
import random
import string
import base64
import cv2

flask_app = Flask(__name__)
socketio = SocketIO(flask_app)

gestures = EyeGestures_v2()
calibMap = np.array([[0,0],[0,0.5],[0,1],
[0.5,0],[0.5,0.5],[0.5,1],
[1,0],[1,0.5],[1,1]])

gestures.enableCNCalib()
gestures.setClassicImpact(2)
# Serve the HTML page with JavaScript for WebSocket communication

@flask_app.route('/')
def index():
    return render_template('v2_test.html')


@flask_app.route('/eyeCanvas.js')
def eyecanvas():
    # unique_id = tasks.generater_ID()
    #  Generate a random string of letters and digits
    random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    # Generate a SHA-256 hash of the random string
    random_hash = hashlib.sha256(random_string.encode()).hexdigest()
    gestures.uploadCalibrationMap(calibMap,context=random_hash)
    return render_template(
        'sdk/eyeCanvas.js',
        domain=request.host,
        unique_id=random_hash)

def base64cv2(img):
    image_data = img.split(',')[1]  # Remove data URI header
    image_array = np.frombuffer(base64.b64decode(image_data), dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    return frame

# Handle WebSocket connections
@socketio.on('msg_data')
def on_stream(data):
    calibrate = data['calibrate']
    frame = base64cv2(data['image'])

    try:
        event, calibration = gestures.step(frame, calibrate, data['width'], data['height'],context=data['unique_id'])
        emit('rsp', {"x" : event.point[0],
                    "y" : event.point[1],
                    "c_x" : calibration.point[0],
                    "c_y" : calibration.point[1]})
    except Exception as e:
        print(f"Caught expression: {str(e)}")
        emit('rsp', {"x" : 0, "y" : 0, "c_x" : 0, "c_y" : 0})

if __name__ == '__main__':
    socketio.run(app=flask_app,host="localhost",port=8000)
