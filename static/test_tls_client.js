var tls = require('tls');

var tlsCount = 0;

function connect() {
    var socket = tls.connect(1234, {rejectUnauthorized: false}, function () {
        tlsCount += 1;
        socket.setEncoding('utf8');
        socket.on('data', function(data) {
        });
        socket.on('close', function() {
            tlsCount -= 1;
        });
    });
}

function memoryUsage() {
    var mem = process.memoryUsage();
    var format = function(bytes) {
        return (bytes/1024/1024).toFixed(2)+'MB';
    };
    console.log('Process: heapTotal '+format(mem.heapTotal) + ' heapUsed ' + format(mem.heapUsed) + ' rss ' + format(mem.rss));
}

var round = 0;
setInterval(function () {
    if (round < 50) {
        for(var i = 0; i < 200; ++i) {
            connect();
        }
        round += 1;
    } else {
        setTimeout(function () {
            process.exit(0);
        }, 3000);
    }

    console.warn("client: tls connections(" + tlsCount + ")");

    memoryUsage();
}, 1000);
