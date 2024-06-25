# flask_app.py
from flask import Flask, render_template, request
from flask_socketio import SocketIO
import time

flask_app = Flask(__name__)
socketio = SocketIO(flask_app)

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

# realtime comms
@socketio.on('connect')
def on_connection():
    socketio.emit('rsp', {"DATA": "echo"})

# Handle WebSocket connections
count_received = 0
@socketio.on('msg')
def on_stream(clientData):
    global count_received
    print(f"on stream {count_received}")
    socketio.emit('rsp', {"DATA": "echo"})
    count_received += 1

if __name__ == '__main__':
    socketio.run(app=flask_app)
