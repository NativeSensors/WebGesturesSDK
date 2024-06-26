
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


function sendFrame(){
    // Flip the image horizontally
    var trasnportContext = trasnportCanvas.getContext('2d');
    trasnportContext.drawImage(video, 0, 0, trasnportCanvas.width, trasnportCanvas.height);
    const imageData = trasnportCanvas.toDataURL('image/jpeg', 0.8); // Convert frame to base64
    display_width = document.body.clientWidth - 75,
    display_height = document.body.clientHeight - 75,


    socket.emit('msg_data', {
        "height"    : display_height, 
        "width"     : display_width,
        "image"     : imageData ,
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
    cursor.style.left = `${data["x"]}px`;
    cursor.style.top = `${data["y"]}px`;
    calib_cursor.style.left = `${data["c_x"]}px`;
    calib_cursor.style.top = `${data["c_y"]}px`;
    sendFrame();
}); 

