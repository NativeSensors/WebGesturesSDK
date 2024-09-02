# flask_app.py
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from eyeGestures.eyegestures import EyeGestures_v2
from celery import Celery
import numpy as np
import hashlib
import random
import string
import base64
import cv2
import tasks

flask_app = Flask(__name__)
socketio = SocketIO(flask_app)

# Serve the HTML page with JavaScript for WebSocket communication

# Configure Celery
flask_app.config['CELERY_CONFIG_MODULE'] = 'celery_config'
flask_app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
flask_app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

# Create Celery instance
celery = Celery(
    flask_app.import_name,
    broker=flask_app.config['CELERY_BROKER_URL'],
    backend=flask_app.config['CELERY_RESULT_BACKEND']
)
celery.conf.update(flask_app.config)

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
    # gestures.uploadCalibrationMap(calibMap,context=random_hash)
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

@socketio.on('on_connect')
def on_connect(data):
    tasks.client_create(
        clientData=data,
        request=request
    )

@socketio.on('disconnect')
def disconnect():
    tasks.client_remove(request)

@socketio.on('msg_data')
def on_stream(data):
    frame = base64cv2(data['image'])
    # frame = cv2.flip(frame, 1) # no flip works fine
    tasks.client_process_data(frame, data, request, emit, request.sid)
    
if __name__ == '__main__':
    socketio.run(app=flask_app,host="0.0.0.0",port=5000)
