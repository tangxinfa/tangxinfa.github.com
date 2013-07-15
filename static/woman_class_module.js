var value = 10;
module.exports = function (name, age) {
    this.name = name;
    this.introduce = function(){
        return this.name + " is " + (age - value);
    };
};
