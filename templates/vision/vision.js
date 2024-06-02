function createCursor(){
    const cursor = document.createElement('div');
    cursor.setAttribute('id','cursor')
  
    var innerDiv = document.createElement('div');
    innerDiv.setAttribute('class', 'cursor_fire');
    var paragraph = document.createElement('p');
    paragraph.setAttribute('class', 'blink_text');
    paragraph.textContent = 'Blink Me!';
    innerDiv.appendChild(paragraph);
  
    cursor.appendChild(innerDiv);
    document.body.appendChild(cursor);
    return cursor;
}
const cursor = createCursor();

function getCursor(){
    return cursor;
}

function updateCursorPosition(cursor, x, y) {
    if(x+50 < document.body.clientWidth){
      cursor.style.left = `${x}px`;
    }
    if(y+50 < document.body.clientHeight){
      cursor.style.top = `${y}px`;
    }
}


function setBackground(element,url){
    element.style.backgroundImage = `url(${url})`;
}

function setChoice(id){
    var element = document.getElementById("meal_1");
    element.style.border = "4px solid #fff0";
    var element = document.getElementById("meal_2");
    element.style.border = "4px solid #fff0";
    var element = document.getElementById("meal_3");
    element.style.border = "4px solid #fff0";

    var element = document.getElementById(id);
    element.style.border = "4px solid #ff8f00";
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: 'smooth' });
}

function sendEmail(event) {
    event.preventDefault();

    // Customize the email subject and body
    var subject = "Contact Eyegestures";
    var body = "I want to express interest ";

    // Construct the mailto URL
    var mailtoUrl = "mailto:contact@eyegeestures.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

    // Open the user's default email client
    window.location.href = mailtoUrl;
}

function onCursor(x,y,fix,blink){
    updateCursorPosition(cursor,x,y);
}

function scanButtons()
{

}

function onFrame(video){
    canvasView = document.getElementById("faceVideoView");
    canvasView.width = 200;
    canvasView.height = 200;
    contextView = canvasView.getContext('2d');
    contextView.translate(canvasView.width, 0);
    contextView.scale(-1, 1);
    contextView.drawImage(video, 0, 0, canvasView.width, canvasView.height);
}

var prev_blink = 0;
function onMagnet(element,fix,blink){

    // cursor.classList.add("is-hovered");
    if(blink == 0 && prev_blink == 1)
    {
        element.click()
    }
    prev_blink = blink;

};

function onMagnetCalibration(completed){
    
};


function update_offset(){

}

// Get viewport width
var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
// Get viewport height
var viewportHeight = (window.innerHeight || document.documentElement.clientHeight) - 50;

EyeMagnetAPI(
"JtLM!H!LqvRR@%Jx@jPGqCP3e2#S4Vqg!Czq2R97SSYp*yxPn&r&&@aFGpZB",1.0,30,
{
    onFrame : onFrame,
    onCursor : onCursor,
    onMagnet : onMagnet,
    onCalibration : function(){},
    onMagnetCalibration : onMagnetCalibration,
    display_width : viewportWidth,
    display_height: viewportHeight,
    calibration : true,
    calibration_layout : true  
}
);