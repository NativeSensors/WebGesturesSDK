
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

const latchCalibrator = {};
function checkCalibrator(class_name,check){
  if (!(class_name in latchCalibrator)){
    latchCalibrator[class_name] = false;
  }

  if(latchCalibrator[class_name]){
    return latchCalibrator[class_name];
  }
  else if(check){
    latchCalibrator[class_name] = check;
    return latchCalibrator[class_name];
  }
}

function resetCalibrators(){
  for(const latchKey in latchCalibrator){
    latchCalibrator[latchKey] = true;
  }
}

function setOffset(x,y){
  offset.x = x;
  offset.y = y;
}


function create_instruction_box(name){

  const instruct_body = document.createElement("div");
  instruct_body.className = "instruct_body";

  const instruction = document.createElement("div");
  instruction.className = "instruction";
  instruction.innerText = "Look there";

  const arrow = document.createElement("div");
  arrow.className = "arrow arrow_"+`${name}`;
  arrow.style.position = "fixed";
  for(let i = 0 ; i < 3 ; i++){
    arrow.appendChild(
      document.createElement("span")
    );
  }

  instruct_body.appendChild(instruction);
  instruct_body.appendChild(arrow);

  return instruct_body;
}

function display_calibrator(name){
  const element = createCalibrator("calibrator calibrator_"+`${name}`+" message-"+`${name}`,"Move cursor here");
  const instruction = create_instruction_box(name);
  const background = document.createElement("div");
  background.className = "calibration_background";
  document.body.appendChild(instruction);
  document.body.appendChild(element);
  document.body.appendChild(background);
}

function remove_calibrator(name){
  var elements = document.getElementsByClassName("calibrator_"+ name);
  if(elements.length > 0)
  {
    elements[0].remove(); // Removes the div with the 'div-02' id
  }
  elements = document.getElementsByClassName("instruct_body");
  if(elements.length > 0)
  {
    elements[0].remove();
  }
  elements = document.getElementsByClassName("calibration_background");
  if(elements.length > 0)
  {
    elements[0].remove();
  }
  elements = document.getElementsByClassName("calibration_background");

}

var calibration_counter = 0;
var calibration_sequence = [];
var startTimestamp = Date.now();
const MIN_TIME_WAIT = 2000;//ms
function calibrator(x,y,fix){
  if(calibration_counter >= calibration_sequence.length && calibration_sequence.length > 0){
    return true;
  }

  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;

  var calib_margin =  160;
  var calib_thresh = 0.2;
  var fixReached = fix  > calib_thresh;

  // check if your calibration just started
  if(calibration_sequence.length == 0){
    console.log(x, width, side_horizontal);
    var side_horizontal = x > width/2; // 0 left, 1 right
    var side_vertical   = y > height/2;// 0 up,   1 down

    if(side_horizontal){
      calibration_sequence.push("right");
      calibration_sequence.push("left");
    }
    else{
      calibration_sequence.push("left");
      calibration_sequence.push("right");
    }

    if(side_vertical){
      calibration_sequence.push("bottom");
      calibration_sequence.push("top");
    }
    else{
      calibration_sequence.push("top");
      calibration_sequence.push("bottom");
    }

    display_calibrator(calibration_sequence[calibration_counter]);
  }

  // Now sequence is ready, so we need to proceed with it

  let ret_val = false;
  if(calibration_counter <= calibration_sequence.length)
  {
    if("left" == calibration_sequence[calibration_counter])
    {
      ret_val = checkCalibrator(
        '.calibrator_'+`${calibration_sequence[calibration_counter]}`,
        x <= calib_margin && fixReached && (Date.now() - startTimestamp) > MIN_TIME_WAIT
      );
    }
    else if("right" == calibration_sequence[calibration_counter]){
      ret_val = checkCalibrator(
        '.calibrator_'+`${calibration_sequence[calibration_counter]}`,
        x >= width - calib_margin && fixReached && (Date.now() - startTimestamp) > MIN_TIME_WAIT
      );
    }
    else if("bottom" == calibration_sequence[calibration_counter]){
      ret_val = checkCalibrator(
        '.calibrator_'+`${calibration_sequence[calibration_counter]}`,
        y >= height - calib_margin && fixReached && (Date.now() - startTimestamp) > MIN_TIME_WAIT
      );
    }
    else if("top" == calibration_sequence[calibration_counter]){
      ret_val = checkCalibrator(
        '.calibrator_'+`${calibration_sequence[calibration_counter]}`,
        y <= calib_margin && fixReached && (Date.now() - startTimestamp) > MIN_TIME_WAIT
      );
    }
  }
  
  if(ret_val){
    remove_calibrator(calibration_sequence[calibration_counter]);
    calibration_counter += 1;
    startTimestamp = Date.now();
    if(calibration_counter < calibration_sequence.length){
      display_calibrator(calibration_sequence[calibration_counter]);
    }
  }

  if(calibration_counter >= calibration_sequence.length){
    return true;
  }
  else{
    return false;
  }
}

function checkCalibration(x,y,fix)
{
  // Get the dimensions of the viewport

  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;

  var calib_margin =  160;
  var calib_thresh = 0.2;
  var fixReached = fix  > calib_thresh;

  return [
    checkCalibrator('.calibrator_left',x <= calib_margin && fixReached),
    checkCalibrator('.calibrator_right' ,x >= width-calib_margin  && fixReached),
    checkCalibrator('.calibrator_top' ,y <= calib_margin && fixReached),
    checkCalibrator('.calibrator_bottom',y >= height-calib_margin && fixReached)
  ];
}

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

function createSocket()
{
  var eyeGesturesDomain = "{{domain}}";
  var addr = 'http://' + eyeGesturesDomain;
  console.log("connecting to: " + addr)
  return io.connect(addr);
}


function EyeGestureApi(API_KEY, thresh, radius, options = {})
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

  var unique_id = "{{unique_id}}";  
  // Set attributes for the video element
  const video = createVideoElement();
  // Append the video element to the body or any other container
  document.body.appendChild(video);
  // Create transport view for changing video frame into sendable item
  const trasnportCanvas = createTransportCanvas();
  // Create socket for cooms
  var socket = createSocket();

  // Send the stream to the server (You need to implement the server-side logic separately)
  navigator.mediaDevices.getUserMedia({ video: true })
  .then(function (stream){    
      if(calibration)
      {
        enableCalibration();
      }

      startVideoPlayer(video,stream);

      // start sending loop
      const frameInterval = 1000 / 15; // Adjust the frame rate as needed
      setInterval(loop,frameInterval);
  }).catch(function(error){
      console.error('Error accessing the camera and microphone:', error);
  });

/* ============================================= API INTERNALS ======================================================= */

  // Emit the '/api/clientData' event with data as soon as the client connects
  socket.on('/api/onConnect', function () {

    console.log("/api/onConnect");
    document.body.style.maxWidth  = document.body.clientWidth;
    document.body.style.maxHeight = document.body.clientHeight;

    const payload = {
      "key" : API_KEY,
      "width"  : display_width,
      "height" : display_height, 
      "unique_id" : unique_id,
      "thresh" : thresh,
      "radius" : radius
    };

    socket.emit('/api/clientData', payload);
  });

  // Listen for 'cursor' events from the server
  var debounce_it = 0;
  const DEBOUNCE_LIM = 30;
  socket.on('/api/cursor', function (event) {

    console.log("Data received to cursor");
    if((Date.now() - event.timestamp) > 200) // 300ms is considered as too slow connection
    {
      onWeakConnection();
    }

    let x = Math.min(event.x, display_width);
    let y = Math.min(event.y, display_height);

    // console.log(left , right , top , bottom);
    if(debounce_it > DEBOUNCE_LIM)
    {
      if(calibrator(x, y, event.fix)){
        disableCalibration();
        onCalibration();
      }
  
      onCursor(x, y, event.fix, event.blink);  
    }
    else{
      debounce_it += 1;
    }
  });

  function disableCalibration()
  {
    socket.emit('/api/stopCalibration', {"key" : API_KEY, "unique_id" : unique_id});
  }

  function enableCalibration(){
    socket.emit('/api/startCalibration', {"key" : API_KEY, "unique_id" : unique_id});
  }
        
  function sendFrame(){
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

    socket.emit('/api/stream', {
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
    sendFrame();
  }

  function startVideoPlayer(video,stream)
  {
    // Display the local video stream
    video.srcObject = stream;
    video.play();
  }
};
