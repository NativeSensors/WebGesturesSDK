# flask_app.py
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from eyeGestures.eyegestures import EyeGestures_v2
import numpy as np
import base64
import cv2

flask_app = Flask(__name__)
socketio = SocketIO(flask_app)
gestures = EyeGestures_v2()

# Serve the HTML page with JavaScript for WebSocket communication

@flask_app.route('/')
def index():
    return render_template('v2_test.html')


@flask_app.route('/eyeCanvas.js')
def eyecanvas():
    # unique_id = tasks.generater_ID()
    return render_template(
        'sdk/eyeCanvas.js',
        domain=request.host,
        unique_id="unique_id")

# Handle WebSocket connections
count = 0
@socketio.on('msg_data')
def on_stream(data):
    global count
    image_data = data['image'].split(',')[1]  # Remove data URI header
    image_array = np.frombuffer(base64.b64decode(image_data), dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    try:
        event, calibration = gestures.step(frame, count < 300, data['width'], data['height'])
        emit('rsp', {"x" : event.point[0], 
                    "y" : event.point[1],
                    "c_x" : calibration.point[0], 
                    "c_y" : calibration.point[1]})
        count+=1
    except:
        emit('rsp', {"x" : 10, 
            "y" : 10,
            "c_x" : 1000, 
            "c_y" : 500})

if __name__ == '__main__':
    socketio.run(app=flask_app,host="localhost",port=8000)
