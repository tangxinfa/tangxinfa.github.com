var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var root = path.resolve(".");
var server = http.createServer();

server.on('request', function(req, res) {
    var filename = decodeURI(url.parse(req.url).pathname);
    filename = path.resolve( "." + filename);
    if(filename.indexOf(root) != 0) {
        res.writeHead(403);
        res.end();
        return;
    }
    fs.readFile(filename, function (err, data) {
        if(err) {
            res.writeHead(err.code == 'ENOENT' ? 404 : 500);
            res.end();
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
});

server.listen(8003);
