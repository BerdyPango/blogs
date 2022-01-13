---
title: Web Front-end Development Notes - Javascript API
date: 2019-11-08 10:11:21
description: Notes of Javascript API
category:
  - WebFrontend
tags:
  - javascript
  - modern-javascript
---

- `eval()`: evaluates JavaScript code represented as a string.

## Object API

- `Object.entries()` returns an array of a given object's own enumerable string-keyed property `[key, value]` pairs.
- `Object.fromEntries()` method transforms a list of key-value pairs into an object.
- `Object.prototype.valueOf()` method returns the primitive value of the specified object. The operator `+`, `-`, `*`, `/` with objects are acutally calling the `valueOf()` method under the hood to first convert objects into primitive values.

### Property Descriptor

- value: current value of the property
- writable: boolean, decides whether the property can be assigned with a new value.
- enumerable: boolean, whether this property will show up in enumerations like `for in` loop or `for of` loop or `Object.keys`, `Object.assign()` etc.
- configurable: boolean, whether it is allowed to change the property descriptor such as to change the value of `writable` and `enumerable` settings.

Using `Object.defineProperty(myObj, 'myProp', {})` gets a default property descriptor of:

```javascript
{
    value: undefined,
    writable: true,
    enumerable: false,
    configurable: false
}
```



