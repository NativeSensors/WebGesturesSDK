
// Create socket for cooms
var eyeGesturesDomain = "{{domain}}";
var addr = 'http://' + eyeGesturesDomain;
const socket =  io.connect(addr);

/* ============================================= API INTERNALS ======================================================= */

socket.on('connect', function()
{
    console.log(`Connection established. socket.id: ${socket.id}`);      
    for(var i = 0 ;i < 10 ; i++)
    {
        console.log("sending message");
        socket.emit('stream', {
            "DUMMY" : "DATA"
        });
    };          
});

socket.on('cursor', (message) => {
    console.log(`Message from server. socket.id: ${socket.id}`);
});


function sendFrame(){

    console.log("sending message");
    socket.emit('stream', {
        "DUMMY" : "DATA"
    });


}

function loop()
{
    sendFrame();
}

frameInterval = 1000;
setInterval(loop,frameInterval);

