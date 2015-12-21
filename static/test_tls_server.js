var tls         = require('tls'),
    fs          = require('fs');


var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
    handshakeTimeout: 10*1000,
    plain: true,
    ssl: true
};

var port = 1234;
var tlsServer = tls.createServer(options, function (socket) {
    socket.on("data", function (data) {

    });
    socket.on("error", function (err) {
        console.warn('tls client(' + socket.remoteAddress + ':' + socket.remotePort +') error(' + err.toString() + ')');
    });
    socket.on("close", function () {
        console.warn('tls client(' + socket.remoteAddress + ':' + socket.remotePort +') closed');
    });
    socket.on("timeout", function () {
        socket.destroy();
    });
}).listen(port, "0.0.0.0", function(){
    console.log('tls server listening on port(' + port + ')');
});
tlsServer.maxConnections = 10000;
tlsServer.on('clientError', function (exception, socket) {
    console.warn('tls client(' + socket.remoteAddress + ':' + socket.remotePort +') error(' + exception + ')');
    socket.destroy();
});

function memoryUsage() {
    var mem = process.memoryUsage();
    var format = function(bytes) {
        return (bytes/1024/1024).toFixed(2)+'MB';
    };
    console.log('Process: heapTotal '+format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
}

setInterval(function () {
    tlsServer.getConnections(function (err, tlsCount) {
        if (err) {
            console.error("get tls connections count error(" + err.toString() + ")");
        }

        console.warn("server: tls connections(" + tlsCount + ")");

        memoryUsage();
    });
}, 1*1000);
