var Woman = require('./woman_class_module.js');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Goddess = function (name, age) {
    EventEmitter.call(this);

    this.woman = new Woman(name, age);
    this.introduce = function () {
        var words = this.woman.introduce();
        this.emit('say', words);
    };
};
util.inherits(Goddess, EventEmitter);


var goddess = new Goddess('刘亦菲', 25);
goddess.on('say', function (words) {
               console.log('转发： ' + words);
           });


goddess.introduce();