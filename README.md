JSClass
=======

Javascript's prototypal inheritance helper using virtual, override, :after and :before

```
var Vehicle = Class.extend({
  "virtual name": function(){
    return "Vehicle";
  }
})

var Car = Class.extend({
  "override name": function(){
    return "Car";
  }
});

Car.mixin({
  "name:before": function(){
    alert("Name is requested");
  }
});
```
