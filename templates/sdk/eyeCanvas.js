
const offset = {
    x : 0,
    y : 0
};

function createCalibrator(className, textContent) {
    const calibrator = document.createElement("div");
    calibrator.className = className;
    calibrator.textContent = textContent;
    return calibrator;
}

function display_calibrator(name){
    const element = createCalibrator("calibrator calibrator_"+`${name}`+" message-"+`${name}`,"Move cursor here");
    const background = document.createElement("div");
    background.className = "calibration_background";
    document.body.appendChild(element);
    document.body.appendChild(background);
}

var calibration_counter = 0;
var calibration_sequence = [];
var startTimestamp = Date.now();
const MIN_TIME_WAIT = 2000;//ms

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
    trasnportCanvas = document.createElement('canvas');
    trasnportCanvas.width = 640;
    trasnportCanvas.height = 360;
    // return trasnportCanvas.getContext('2d');
    return trasnportCanvas;
}



function EyeCanvasApi(API_KEY, thresh, radius, options = {})
{
    const {
        display_width = document.body.clientWidth - 75,
        display_height = document.body.clientHeight - 75,
        onFrame = function(video){},
        onCursor = function(x,y,fix,blink){},
        onCalibration = function(){},
        onWeakConnection = function(){},
        calibration_layout = true,
        calibration = true,
        DEBUG = false
    } = options;

    // Create socket for cooms
    var eyeGesturesDomain = "{{domain}}";
    var addr = 'http://' + eyeGesturesDomain;
    const socket =  io.connect(addr);
    console.log("socket.id: ", socket.id);

    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });

    var unique_id = "{{unique_id}}";  
    // Set attributes for the video element
    const video = createVideoElement();
    // Append the video element to the body or any other container
    document.body.appendChild(video);
    // Create transport view for changing video frame into sendable item
    const trasnportCanvas = createTransportCanvas();

    /* ============================================= API INTERNALS ======================================================= */


    socket.on('connect', function()
    {
        console.log(`Connection established. socket.id: ${socket.id}`);        
    });

    // Emit the '/api/clientData' event with data as soon as the client connects
    socket.on('/api/onConnect', function () {
        console.log("/api/onConnect");
    });

    socket.on("disconnect", () => {
        console.log(`disconnected: ${socket.id}`); // undefined
    });

    socket.on('cursor', (message) => {
        console.log(`Message from server. socket.id: ${socket.id}`);
    });

    function sendFrame(){
        console.log(`sending frame. Socket id: ${socket.id}`);
        // Flip the image horizontally
        trasnportContext = trasnportCanvas.getContext('2d');
        if(DEBUG){
            var image = new Image();
            image.src = '/demo_pic/debug_face.jpg';
            trasnportContext.drawImage(image, 0, 0, trasnportCanvas.width, trasnportCanvas.height);
            onFrame(image); // for user to draw/display/image on the screen - we use hidden display

        }
        else{
            trasnportContext.drawImage(video, 0, 0, trasnportCanvas.width, trasnportCanvas.height);
            onFrame(video); // for user to draw/display/image on the screen - we use hidden display
        }

        const imageData = trasnportCanvas.toDataURL('image/jpeg', 0.8); // Convert frame to base64

        socket.emit('/api_v2/stream', {
            "key" : API_KEY,
            "unique_id" : unique_id,
            "thresh"    : thresh,
            "radius"    : radius,
            "height"    : display_height,
            "width"     : display_width,
            "offset_x"  : offset.x,
            "offset_y"  : offset.y,
            "image"     : imageData ,
            "timestamp" : Date.now()
        });
    }

    function loop()
    {
        socket.on('cursor', (message) => {
            console.log(`Message from server 2: ${message}`);
        });
    
        sendFrame();
    }

    function startVideoPlayer(video,stream)
    {
        // Display the local video stream
        video.srcObject = stream;
        video.play();
    }

    // Send the stream to the server (You need to implement the server-side logic separately)
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream){
        startVideoPlayer(video,stream);

        // start sending loop
        const frameInterval = 1000; // Adjust the frame rate as needed
        setInterval(loop,frameInterval);
    }).catch(function(error){
        console.error('Error accessing the camera and microphone:', error);
    });
};
