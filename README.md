The low-down
============

Tiny toolkit is a small (I'm trying to keep it near 10kb, it's a little over atm, but at least it minifies to 5kb) library that expands the JS API for HTML elements, element creation, and element query selecting. Think of it as a pocket knife for DOM stuff, contrasted to jQuery's squadron of helicopter gunships.

One thing it does quite well is not care about whether your selector found zero, one, or multiple results. The API will be the same, so none of that crazy $("p")[0] nonsense: just use find("p") and if there's only one result, that will be a normal HTML element. With extended API. If there's more, it'll be an array. With the same extended API.

Most functions chain, meaning you can do things like:

    document.body.add(
      create("div", {id: "temp"}, "This is a temp div")
      .show(false)
    ).find("#temp")
     .parent()
     .get(0)
     .remove()

(yes, that's a very elaborate way to effect a net result of no change - make div, add div, make div invisible, find div in body, get div's parent, which is body, get body's first child, which is div, then tell that to remove itself).

Note that tiny toolkit "installs" itself into the DOM API. As such, it's not so much a library as bolt-on JS API extension. It changes the Array and HTMLElement prototypes, and this may break things. If you don't like that, don't use this. Frankly, the Array and HTMLElement JS APIs are long overdue for an update, and it was starting to annoy me to no end. So this fixed that for me. Hopefully it fixes things for you too =)

Extended Window API
-------------------

These can be called from anywhere.

* get(url, [callback]) - AJAX fetch. Returns the requested data if no callback is provided, otherwise this is an async call, with the callback needing to be of form function(xhr){...}, where xhr is the request's XMLHttpRequest object.
* create(tagname, [properties], [innerHTML]) - create an html element. properties and innerHTML are both optional. Properties don't use special naming conventions so if you want to set a class attribute, use {..., "class":"className1 className2", ...}.
* find(selector) - tries to find all HTML elements that match the given CSS selector. API wise, it doesn't matter whether the result is one or more elements, since arrays of HTML elements and HTML elements have the same API when using this extension.
* exists(thing) - shorthand function for (thing!==undefined && thing!==null), as a safer alternative to just letting JavaScript coerce something into a boolean. Concisely: exists(""), exists(false), and exists(0) will all return "true".

Extended HTMLElement API
------------------------

These can be called on any JavaScript reference to an HTML element on your page. Unless indicated, these functions return a reference to the element itself, so you can chain function calls.

* find(selector) - does the same as window.find(), but then on the element's subtree only.
* html([newContent]) - get the current innerHTML, or if newContent is given, set the innerHTML.
* position() - gets the element's absolute position and bounding box for this page.
* css(propertyName, [newValue]) - either get or set a CSS property. Note that this uses the JavaScript element.style.[...] naming convention.
* css({prop:val object}) - same function as css(prop,val), alternative call: argument is an object of CSS property:value pairs using JavaScript naming.
* show(showOrNot) - If passed [true], shows element. If passed [false], hides element. This uses a css rule bound to a private data attribute, not an override on the element using its "style" attribute.
* toggle - if the element is visible, hides it. If hidden, shows it. If your own CSS can overrule this, it will.
* classes().add("className") - add a class to this element.
* classes().remove("className") - remove a class to this element.
* classes().contains("className") - check whether this element is assigned a specific class. This function breaks chaining.

* parent([newParent]) - get this element's parent. If a new parent is given, this element is moved from wherever it is now to a position as last child of this new parent. When a new parent is given, the return value is the element. Without a new parent, the return value is the parent.
* add(element, [element2], [element3], ...) - add one or more children to this element.
* replace(a, [b]) - If one argument is given, the element is replaced with the element "a". If two arguments are given, child element "a" for this element is replaced by (possibly non-child) element "b".
* remove([child]) - if no arguments are given, removes this element from its parent. If one argument is given, its type determines what happens. If it's a number, the child in that array position will be removed. If it's another HTML element, that element as child will be removed from this element.
* clear - remove all children from this element.

* get(something) - if "something" is a number, gets the child with corresponding array index. If it's a string, this returns the attribute value for the associated attribute.
* set(something, value) - sets an attribute value for this element.
* set({attr:val object}) - same call, for more than one attribute:value pair.

* listen(eventName, function) - alternative to .addEventListener
* forget(eventName, [function]) - alternative to .removeEventListener if "function" is provided. If not, all event listeners for the indicated event are removed.
* listenOnce(eventName, function) - sets up a one-time event listener for the indicated event. As long as the event has not fired yet, the list of event listeners will include this function. Once it fires, the function is removed from the list of event listeners.
* forEach(function) - run a function with this element. function format is: function(arg1){...}, arg1 is autopopulated as the element in question. This function exists to make it irrelevant whether the result from find() is a single element or an array of elements.


* .length - list API homogenisation. Always "1"
* .eventListeners - an object representing all known event listeners for this element, of the form:

```
{ owner: element,
  events: [known event name 1, name 2, 3, ...],
  listeners: {
    known event name 1: [function1, function2, 3, ...]
    name 2: [...]
    3: [...]
    ...
  }
}
```

Extended Array API
------------------

These can currently be called on any JavaScript array. I will likely modify the library so that this API only applies to arrays that come rolling out of find(), although this will slow things down so... we'll see. For now:

* pushUnique(element) - Add only if not already in array.
* test(testFunction, [strict]) - Similar to a forEach, runs the testFunction on every element in the array. If strict is true, returns true if all elements make the test function return true. If omitted, returns true if there is at least one element that makes the test function return true.
* forEach - same as before, except now it returns the array, for chaining.

In addition to this, all the chaining HTML Element API functions are supported. When called, these will run for all elements. For getters, this will return an array of the same size as the element array, with return values in the same place as the original elements: [e1,e2,e3].get("style") when only e2 has a style attribute with display:inline will return ["", "display: inline", ""], for instance.

Tests
-----

There's a battery of tests for the API, using QUnit. So far all tests pass on Chrome, Firefox, Opera, Safari and IE. If you're doing something and you run into a bug, file an issue and I can add a test for it, then fix it (in that order).

- Pomax