
// Create socket for cooms
var eyeGesturesDomain = "{{domain}}";
var addr = 'ws://' + eyeGesturesDomain;
var socket =  io.connect(addr);

socket.on('connect', function()
{
    console.log(`Connection established. socket.id: ${socket.id}`);
});


var count_sent = 0;
function sendFrame()
{
    console.log("sending message: " + count_sent);
    socket.emit('msg', {
        "DUMMY" : "DATA"
    });
    count_sent+=1;
}

function loop()
{
    sendFrame();
}

var frameInterval = 1000;
setInterval(loop,frameInterval);

socket.on('rsp', function(data){
    console.log(`Message from server. socket.id: ${socket.id}`);
});
