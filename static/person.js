function Person(name) {
    this.name = name;
}

Person.prototype.introduce = function () {
    return "My name is " + this.name;
};


var jack = new Person("jack");
console.log(jack.introduce());
//output: My name is jack
