
// Create socket for cooms
var eyeGesturesDomain = "{{domain}}";
var addr = 'http://' + eyeGesturesDomain;
const socket =  io.connect(addr);

/* ============================================= API INTERNALS ======================================================= */

socket.on('connect', function()
{
    console.log(`Connection established. socket.id: ${socket.id}`);   
});

socket.on('rsp', (message) => {
    console.log(`Message from server. socket.id: ${socket.id}`);
});

var count_sent = 0;
function sendFrame()
{
    console.log("sending message: "+count_sent);
    socket.emit('msg', {
        "DUMMY" : "DATA"
    });
    count_sent+=1;
}

function loop()
{
    sendFrame();
}

frameInterval = 1000;
setInterval(loop,frameInterval);

