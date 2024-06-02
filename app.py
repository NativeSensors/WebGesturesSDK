# flask_app.py
from flask import Flask, redirect, render_template, request, send_from_directory, send_file
from flask_cors import CORS
from celery import Celery
from flask_socketio import SocketIO, emit
from datetime import datetime
import logging
import tasks
import os

# CLIENTS_LIMIT = 49
SILENT_KEY = "v49e$8gGeNV3ve3xfwuPStt82bM@nSMVUeJF36LM4aTZ!^q87@G^6xtxJUqM"

flask_app = Flask(__name__)
socketio = SocketIO(flask_app, cors_allowed_origins="*")

# Serve the HTML page with JavaScript for WebSocket communication
@flask_app.route('/')
def index():

    # if(len(tasks.get_clients()) > CLIENTS_LIMIT):
    #     return render_template('we_are_at_full_capacity.html')

    user_agent = request.headers.get('User-Agent')
    user_agent = user_agent.lower()

    # prepare unique_id and key and set key into dict
    if "iphone" in user_agent:
        return render_template('we_are_at_ful_capacity.html')
    elif "android" in user_agent:
        return render_template('we_are_at_ful_capacity.html')
    else:
        return redirect('/vision/vision.html')
        # return render_template('main.html')
    
# Serve the HTML page with JavaScript for WebSocket communication
@flask_app.route('/debug')
def debug():
    # prepare unique_id and key and set key into dict
    return render_template('main_DEBUG.html')

# Serve the HTML page with JavaScript for WebSocket communication
@flask_app.route('/game')
def demo_game():
    return render_template('demos/game.html')

# Serve the HTML page with JavaScript for WebSocket communication
@flask_app.route('/cinema')
def demo_cinema():
    return render_template('demos/cinema.html')

@flask_app.route('/restaurant')
def demo_restaurant():
    return render_template('demos/restaurant.html')

@flask_app.route('/eyegestures.js')
def webgestures():
    unique_id = tasks.generater_ID()
    return render_template('sdk/eyegestures.min.js', domain = request.host, unique_id = unique_id)

@flask_app.route('/eyeTiles.js')
def webTiles():
    unique_id = tasks.generater_ID()
    return render_template('sdk/eyeTiles.min.js', domain = request.host, unique_id = unique_id) 

@flask_app.route('/eyeMagnet.js')
def eyeMagnet():
    unique_id = tasks.generater_ID()
    return render_template('sdk/eyeMagnet.min.js', domain = request.host, unique_id = unique_id)

@flask_app.route('/eyeGest.js')
def eyeGest():
    unique_id = tasks.generater_ID()
    return render_template('sdk/eyeGest.min.js', domain = request.host, unique_id = unique_id)

@flask_app.route('/vision/<path:name>')
def vision(name):
    if 'css' in name:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'), name)
    elif name == "eyeGest.js":
        unique_id = tasks.generater_ID()
        return render_template('sdk/eyeGest.min.js', domain = request.host, unique_id = unique_id)
    else:
        return render_template(f"vision/{name}")


@flask_app.route('/styles.css')
def styles():
    
    user_agent = request.headers.get('User-Agent')
    user_agent = user_agent.lower()
    
    logging.info(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")} emiting styles ti ua: {user_agent}')
    if "iphone" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'mobile.styles.css')
    elif "android" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'mobile.styles.css')
    else:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'styles.css')

@flask_app.route('/eyegestures.css')
def eyegestures_styles():
    
    user_agent = request.headers.get('User-Agent')
    user_agent = user_agent.lower()
    
    logging.info(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")} emiting styles ti ua: {user_agent}')
    if "iphone" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyegestures.mobile.styles.css')
    elif "android" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyegestures.mobile.styles.css')
    else:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyegestures.styles.css')

@flask_app.route('/eyeTiles.css')
def eyeTiles_styles():
    
    user_agent = request.headers.get('User-Agent')
    user_agent = user_agent.lower()
    
    logging.info(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")} emiting styles ti ua: {user_agent}')
    if "iphone" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyeTiles.mobile.styles.css')
    elif "android" in user_agent:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyeTiles.mobile.styles.css')
    else:
        return send_from_directory(os.path.join(flask_app.root_path, 'static'),'eyeTiles.styles.css')


@flask_app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(flask_app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@flask_app.route('/UpDown.ico')
def upDown():
    return send_from_directory(os.path.join(flask_app.root_path, 'static'),
                               'UpDown.ico', mimetype='image/vnd.microsoft.icon')

@flask_app.route('/LeftRight.ico')
def leftRight():
    return send_from_directory(os.path.join(flask_app.root_path, 'static'),
                               'LeftRight.ico', mimetype='image/vnd.microsoft.icon')

@flask_app.route('/Calib.ico')
def Calib():
    return send_from_directory(os.path.join(flask_app.root_path, 'static'),
                               'Calib.ico', mimetype='image/vnd.microsoft.icon')

@flask_app.route('/license')
def license():
    return render_template('license.html')

@flask_app.route('/demo_pic/<path:name>')
def demo_pics(name):
    ret = send_from_directory(os.path.join(flask_app.root_path, 'static/demo_pic'),f'{name}')
    return ret

@flask_app.route('/download', methods=['POST'])
def download_file():
    exe_file = request.form.get('executable')

    if exe_file == 'linux':
        return send_from_directory(os.path.join(flask_app.root_path, 'static/exe'), 'eyegestures_linux')
    elif exe_file == 'windows':
        return send_from_directory(os.path.join(flask_app.root_path, 'static/exe'), 'eyegestures_win.exe')
    else:
        # Handle the case where the form is submitted without selecting a file
        return "Invalid request"

# realtime comms
@socketio.on('connect')
def on_connection():
    # Broadcast the received image data to all connected clients
    logging.info(f'{datetime.now().strftime("%m:%d:%Y:%H:%M:%S")} new connection')
    emit('/api/onConnect', {})

@socketio.on('/api/disconnect')
def on_disconnect():
    tasks.client_remove(request)
    
# Handle WebSocket connections
@socketio.on('/api/clientData')
def on_clientData(clientData):
    tasks.client_create(clientData,request)
    
@socketio.on('/api/stopCalibration')
def on_stopCalibration(clientData):
    tasks.client_stop_calibration(clientData,request)

@socketio.on('/api/startCalibration')
def on_startCalibration(clientData):
    tasks.client_start_calibration(clientData,request)

# Handle WebSocket connections
@socketio.on('/api/stream')
def handle_image(clientData):
    payload = tasks.client_process_data(clientData)
    print(f"sid: {request.sid}")
    emit('/api/cursor',payload, room=request.sid)

if __name__ == '__main__':
    logging.basicConfig(filename='flask_app.log', encoding='utf-8', level=logging.DEBUG)
    flask_app.run(debug=True)
    # socketio.run(host="0.0.0.0",debug=True)