function Woman(name, age) {
    Person.call(this, name);
    
    this.introduce = function(){
        return this.name + " is " + (age - 10);
    };
}
Woman.prototype = new Person();
Woman.prototype.constructor = Woman;

var mary = new Woman("mary", 34);
var rose = new Woman("rose", 45);
console.log(mary.introduce());
console.log(rose.introduce());
//output: mary is 24
//        rose is 35
