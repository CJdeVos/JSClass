JSClass
=======

Javascript's prototypal inheritance helper using virtual, override, :after and :before

```
var Vehicle = Class.extend({
  "virtual name": function(){
    return "Vehicle";
  }
})

var Car = Vehicle.extend({
  "override name": function(){
    return "Car";
  }
});

Car.mixin({
  "name:before": function(){
    alert("Name is requested");
  }
});

var v = new Vehicle();
var c = new Car();

console.log(c instanceof Car);
console.log(c instanceof Vehicle);
console.log(v.name());
console.log(c.name());
```
