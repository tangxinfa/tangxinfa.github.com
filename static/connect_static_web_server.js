var connect = require('connect');
var app = connect()
    .use(connect.static('.'));

app.listen(8004);
