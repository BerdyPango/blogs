---
title: ES6+ Cheatsheet
description: Cheatsheet of ES6+ features
category:
  - WebFrontend
tags:
  - javascript
  - ecmascript
date: 2022-04-20 15:38:14
---


{% cq %}**New types**{% endcq %}

- [Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol): Symbols are not enumerable in `for...in` iterations, use `Object.getOwnPropertySymbols()` to get these.
- [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

{% cq %}**Classes, Inheritance, Setters,Getters**{% endcq %}
```javascript
class Rectangle extends Shape {
 constructor (id, x, y, w, h) {
 super(id, x, y)
 this.width = w
 this.height = h
 }
 // Getter and setter
 set width (w) { this._width = w }
 get width () { return this._width }
}

class Circle extends Shape {
 constructor (id, x, y, radius) {
 super(id, x, y)
 this.radius = radius
 }

 do_a(x) {
 let a = 12;
 super.do_a(x + a);
 }
 static do_b() { ... }
}

Circle.do_b()
```

{% cq %}**Promises**{% endcq %}
```javascript
new Promise((resolve, reject) => {
  request.get(url, (error, response, body) => {
    if (body) {
      resolve(JSON.parse(body));
    } else {
      resolve({});
    }
  });
})
  .then(() => {})
  .catch((err) => throw err);
// Parallelize tasks
Promise.all([promise1, promise2, promise3]).then(() => {
  // all tasks are finished
});
```

{% cq %}**Modules `import` & `export`**{% endcq %}
```javascript
export var num = 50; 
export function getName(fullName) {   
   //data
};

import {num, getName} from 'module';
console.log(num); // 50
```


{% cq %}**Arrow function**{% endcq %}
```javascript
const sum = (a, b) => a + b

console.log(sum(2, 6)) // prints 8
```

{% cq %}`const` & `let`{% endcq %}

`let`
```Javascript
let a = 3

if (true) {
    let a = 5
    console.log(a) // prints 5
}

console.log(a) // prints 3
```

`const`
```javascript
// can be assigned only once:
const a = 55

a = 44 // throws an error
```

{% cq %}**Default parameters**{% endcq %}
```javascript
function print(a = 5) {
    console.log(a)
}

print() // prints 5
print(22) // prints 22
```

{% cq %}**String interpolation**{% endcq %}
```javascript
const name = 'Leon'
const message = `Hello ${name}`

console.log(message) // prints "Hello Leon"
```

{% cq %}**Multiline string**{% endcq %}
```javascript
console.log(`
  This is a 
  multiline string
`)
```

{% cq %}**`string.padStart()` & `string.padEnd()`**{% endcq %}
```javascript
> '1'.padStart(3, 0);
< "001"

> 1.padEnd(7, "X");
< "1XXXXXX"
```

{% cq %}**Spread operator `...`**{% endcq %}
```javascript
const a = [ 1, 2 ]
const b = [ 3, 4 ]

const c = [ ...a, ...b ]

console.log(c) // [1, 2, 3, 4]
```

{% cq %}**Destructuring**{% endcq %}
```javascript
let obj = { 
  a: 55,
  b: 44
};

let { a, b } = obj;

console.log(a); // 55
console.log(b); // 44
```

{% cq %}**Exponential Operator `**`**{% endcq %}
```javascript
> 2**2**2
< 16

> 3**3
< 27
```

{% cq %}**`for...of`**{% endcq %}

The `for..of` loop in JavaScript allows you to iterate over iterables (arrays, sets, maps, strings etc).
```javascript
for (element of iterable) {
    // body of for...of
}
```
- iterable - an iterable object (array, set, strings, etc).
- element - items in the iterable

{% cq %}**Class properties**{% endcq %}

```javascript
class Animal {
    constructor() {
        this.name = "Lion"
    }
    // directly define class property
    age = 0;
}
```

{% cq %}**Generators**{% endcq %}

```javascript
// generator function
function* generatorFunc() {

    console.log("1. code before the first yield");
    yield 100;
    
   console.log("2. code before the second yield");
    yield 200;
}

// returns generator object
const generator = generatorFunc();

console.log(generator.next());

< 1. code before the first yield
< {value: 100, done: false}
```