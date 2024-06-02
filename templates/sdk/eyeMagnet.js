// THIS IS NEW API - EYEGRAVITY -- NOT DEPLOYABLE YET

// const centerPoint = document.getElementById("centerPoint");
// const userGaze = document.getElementById("userGaze");

const magnetStrong = 0.7;
const magnetAssistanceRange = 100;
const velocity_thresh = 0.4;

const currentElement = {
  el: null,
  frame: 0
};

const dot = {
  x: 0,
  y: 0,
  offset_x : 0,
  offset_y : 0,
  offset_ret_x : 0,
  offset_ret_y : 0,
  margin: 50,
  angle: Math.random() * Math.PI * 2, // Initial random angle
  radius: 20, // Radius of the circular motion
  speed: 0.005, // Angular speed
  history: []
};

var eyeMagnetRun = true;
function EyeMagnetStop(){
  eyeMagnetRun = false;
}

function EyeMagnetStart(){
  eyeMagnetRun = true;
}

function EyeMagnetAPI(API_KEY, thresh, radius, options = {})
{
  const {
    onFrame = function(video){},
    onCursor = function(x,y,fix,blink){},
    onMagnet = function(element,fix,blink){},
    onCalibration = function(){},
    onWeakConnection = function(){},
    onMagnetCalibration = function(completed){},
    display_width  = document.body.clientWidth - 75,
    display_height = document.body.clientHeight - 75,
    calibration_layout = true,
    calibration = true,
    DEBUG = false,
  } = options;

  function scanMagnet(center_x,center_y,margin){
    let StrongElements = document.getElementsByClassName("eyeMagnet");
    var element = null;
    Array.prototype.forEach.call(StrongElements, function(el){
      if(checkCorner(center_x,center_y,el,margin)){
        element = el;
        // g = getMagnetVector(x,y,magnet_x,magnet_y,magnet_strength);
      }
    });
    return element;
  }

  function getMagnetVector(x,y,magnet_x,magnet_y, strength){
    let [g_x, g_y] = [(magnet_x - x) * strength, (magnet_y - y) * strength];
    return [g_x, g_y];
  }

  function updateDot(x,y) {
    dot.x = x;
    dot.y = y;
    dot.history.push({ x: dot.x + dot.offset_x, y: dot.y + dot.offset_y, time: new Date()});

    if (dot.history.length > 10) {
      dot.history.shift(); // Keep only the last 20 positions
    }
  }

  function getVelocity(array){
    let elapsed_time =  array[array.length-1].time.getTime() - array[0].time.getTime();
    let dist_x = (array[array.length-1].x - array[0].x);
    let dist_y = (array[array.length-1].y - array[0].y);
    let distance = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
    let velocity = distance/elapsed_time;
    return velocity;
  }

  var magnet_counter = 0;
  function updateView(fix,blink) {

    // Calculate the center of the cluster
    let sumX = 0, sumY = 0;
    for (const position of dot.history) {
      sumX += position.x;
      sumY += position.y;
    }

    let velocity = getVelocity(dot.history);
    
    const centerX = sumX / dot.history.length;
    const centerY = sumY / dot.history.length;
    var el = scanMagnet(centerX,centerY, magnetStrong, dot.margin);
    if(el !== null && el !== undefined && velocity < velocity_thresh){
      var modifier = 1.0;
      if(currentElement.el == null){
        currentElement.el = el;
        magnet_counter = 0;
      }
      else if(dot.margin < 5.0){
        currentElement.frame += 1;

        if(currentElement.frame > 20){
          modifier = 0.0;
        }
        onMagnetCalibration(currentElement.frame/20);
      }

      onMagnet(currentElement.el,fix,blink);
      
      // Update the position of the center point
      var rect = el.getBoundingClientRect();
      let magnet_x = parseInt(rect.left) + parseInt(rect.width)/2;
      let magnet_y = parseInt(rect.top) + parseInt(rect.height)/2;

      var [dX,dY] = getMagnetVector(dot.x + dot.offset_x ,dot.y + dot.offset_y,magnet_x,magnet_y, magnetStrong * modifier);

      dot.offset_x += dX;
      dot.offset_y += dY;
      
      if(magnet_counter > 10){
        var [gaze_dX, gaze_dY] = getMagnetVector(dot.x + dot.offset_x, dot.y + dot.offset_y, dot.x, dot.y, -0.01 * modifier);
        dot.offset_x -= gaze_dX;
        dot.offset_y -= gaze_dY;
        dot.offset_ret_x += gaze_dX;
        dot.offset_ret_y += gaze_dY;  
        dot.margin = getMargin(gaze_dX,gaze_dY);
        setOffset(dot.offset_ret_x,dot.offset_ret_y);
      }
      magnet_counter+=1;
      onCursor(centerX, centerY, fix, blink);
    }
    else{
      currentElement.el = null;
      currentElement.frame = 0;
      var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

      if(dot.x + dot.offset_x < 0 || dot.x + dot.offset_x > screenWidth || dot.y + dot.offset_y < 0 || dot.y + dot.offset_y > screenHeight){
        dot.offset_x = 0;
        dot.offset_y = 0;
        dot.offset_ret_x = 0;
        dot.offset_ret_y = 0;  
      }

      onCursor(dot.x + dot.offset_x, dot.y + dot.offset_y, fix, blink);
    }
  }

  function getMargin(diff_x,diff_y){
    let ret = Math.sqrt(diff_x*diff_x + diff_y*diff_y)
    if(ret > magnetAssistanceRange){
      return magnetAssistanceRange;
    }
    return ret;
  }

  function checkCorner(x,y,el,margin)
  {
    var rect = el.getBoundingClientRect();
    let left   = parseInt(rect.left) - margin;
    let topPos = parseInt(rect.top)  - margin;
    let width  = parseInt(rect.width) + margin;
    let height = parseInt(rect.height) + margin;
    var ret = (parseFloat(x) >= left &&
      parseFloat(x) <= left + width &&
      parseFloat(y) >= topPos &&
      parseFloat(y) <= topPos + height);
    return ret;
  }

  function moveDot(x,y,fix,blink) {
    updateDot(x,y);
    updateView(fix,blink);
  }

  var calibrated = false;
  function __onCalibration(){
    calibrated = true;
    onCalibration();
  }

  function __onCursor(x,y,fix,blink){
    if(!eyeMagnetRun){
      return; 
    }

    if(calibrated){
      moveDot(x, y, fix,blink);
    }
    else{
      onCursor(x, y, fix, blink);
    }
  }

  EyeGestureApi(API_KEY, thresh, radius,
    {
      onFrame : onFrame,
      onCursor : __onCursor,
      onCalibration : __onCalibration,
      onWeakConnection : onWeakConnection,
      calibration : calibration, 
      calibration_layout : calibration_layout,
      display_width : display_width,
      display_height: display_height,
      DEBUG : DEBUG,
    }
  );
}