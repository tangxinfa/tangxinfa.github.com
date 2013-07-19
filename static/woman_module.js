var value = 10; //module private variable.
exports.Woman = function (name, age) {
    this.name = name;
    this.introduce = function(){
        return this.name + " is " + (age - value);
    };
};
