
const cursor = document.createElement('div');
cursor.setAttribute('id','cursor')
document.body.appendChild(cursor);

const calib_cursor = document.createElement('div');
calib_cursor.setAttribute('id','calib_cursor')
document.body.appendChild(calib_cursor);

function createVideoElement(){
    let video = document.createElement("video");
    video.id = "localVideo";
    video.width = 360;
    video.height = 240;
    video.autoplay = true;
    video.muted = true;
    video.hidden = true;
    video.style.width = "auto";
    video.style.height = "auto";
    return video;
}

function createTransportCanvas(){
    // Send each frame to the server
    let trasnportCanvas = document.createElement('canvas');
    trasnportCanvas.width = 640;
    trasnportCanvas.height = 360;
    // return trasnportCanvas.getContext('2d');
    return trasnportCanvas;
}

const video = createVideoElement();
// Append the video element to the body or any other container
document.body.appendChild(video);
// Create transport view for changing video frame into sendable item
const trasnportCanvas = createTransportCanvas();

const socket = io();

navigator.mediaDevices.getUserMedia({ video: true })
.then(function (stream){    
    startVideoPlayer(video,stream);
    // start sending loop
    sendFrame();
}).catch(function(error){
    console.error('Error accessing the camera and microphone:', error);
});

var calibration_counter = 0;
var calibration_points = 15;
var calibration_point = {'x':0, 'y':0};
var point = {'x':0, 'y':0};

function calibrated(){
    return calibration_counter > calibration_points
}

function update_calibrate_point(x,y)
{
    if(!calibrated() && (x !=  calibration_point.x || y != calibration_point.y))
    {
        calibration_point.x = x;
        calibration_point.y = y;
        calibration_counter +=1;
    }
}

function update_point(x,y)
{
    display_width  = document.body.clientWidth  - 100;
    display_height = document.body.clientHeight - 100;

    point.x = x < display_width? x : display_width;
    point.y = y < display_height? y : display_height;
    point.x = x > 0? x : 0;
    point.y = y > 0? y : 0;
}

function sendFrame(){
    // Flip the image horizontally
    var trasnportContext = trasnportCanvas.getContext('2d');
    trasnportContext.drawImage(video, 0, 0, trasnportCanvas.width, trasnportCanvas.height);
    const imageData = trasnportCanvas.toDataURL('image/jpeg', 0.8); // Convert frame to base64
    display_width  = document.body.clientWidth  - 75,
    display_height = document.body.clientHeight - 75,

    socket.emit('msg_data', {
        "height"    : display_height, 
        "width"     : display_width,
        "image"     : imageData ,
        "calibrate" : !calibrated(),
        "timestamp" : Date.now()
    });
}


function startVideoPlayer(video,stream)
{
    // Display the local video stream
    video.srcObject = stream;
    video.play();
}

socket.on('rsp', (data) => {
    update_calibrate_point(data["c_x"],data["c_y"])
    update_point(data["x"],data["y"])
    cursor.style.left = `${point.x}px`;
    cursor.style.top = `${point.y}px`;
    calib_cursor.style.left = `${calibration_point.x}px`;
    calib_cursor.style.top = `${calibration_point.y}px`;
    sendFrame();
}); 

