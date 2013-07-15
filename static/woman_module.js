var value = 10;
exports.Woman = function (name, age) {
    this.name = name;
    this.introduce = function(){
        return this.name + " is " + (age - value);
    };
};
