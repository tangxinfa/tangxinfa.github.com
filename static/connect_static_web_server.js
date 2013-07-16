var connect = require('connect');
var app = connect()
    .use(connect.logger())               // 输出访问
    .use(connect.static(__dirname))      // 静态文件
    .use(connect.directory(__dirname))   // 目录浏览
    .listen(8004);
