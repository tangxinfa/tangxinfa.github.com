var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'mysql'
});

connection.connect(function (err) {
    if(err) {
        throw err;
    }

    connection.query('select host, user from user', function (err, results) {
        if (err) {
            throw err;
        } else {
            results.forEach(function(row){
                console.log(row.host + '\t' + row.user);
            });
        }
        connection.end();
    });
});
