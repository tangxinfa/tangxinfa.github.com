var net = require('net');

var server = net.createServer(
    function (socket) {
        socket.pipe(socket);
    }
);

server.listen(8001);
console.log("Server running");
