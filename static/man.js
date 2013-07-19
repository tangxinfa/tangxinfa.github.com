function Man(name, age) {
    Person.call(this, name);
    this.age = age;
}
Man.prototype = new Person();
Man.prototype.constructor = Man;
Man.prototype.introduce = function(){
    return this.name + " is " + this.age;
};

var jack = new Man("jack", 24);
console.log(jack.introduce());
//output: jack is 24
