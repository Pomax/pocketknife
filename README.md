Tiny Toolkit
============

This is a quick and dirty JS toolkit for HTLM element manipulation.
While it might look like a jQuery-a-like, it has nothing that
makes jQuery so powerful, so if you're already using jQuery
on a site: you have no reason to use this toolkit.

That said, it is pretty damn small compared to jQuery... So,
use your best judgement?

Note that I make no pretenses at backward compatibility.
This library is only for browsers that natively support canvas,
which rules out all the ancient browsers. I Look forward to
the days when we look back at this period and laugh at the legacy.

- Pomax

API
---

### window

window gets extended with several new functions:

  * extend(e) - toolkit-extend an HTML element. It stays an HTML element.
  * create(tagname) - create an extend()ed HTML element
  * template(name, substitutions) - create an extend()ed HTML element from
                                   a template file (found as name + ".tpl.html"),
                                   with {{label}} placeholders replaced by
                                   what you indicate as substitution string
                                   in the substitutions object.
  * find(selector) - returns extend()ed HTML element(s) based on CSS selector

### document

document is automatically extend()ed on load

### body

body is automatically extend()ed on DOMContentLoaded

### HTML elements

extended HTML elements have the following API. All function calls chain,
except for those indicated:

  * find(selector) - find inside the HTML's DOM fragment
  * template(name, substitutions) - fill this HTML element with a fragment from
                                    a template file (found as name + ".tpl.html"),
                                    with {{label}} placeholders replaced by
                                    what you indicate as substitution string
                                    in the substitutions object.
  * css(propname) - get the computed or declared value (resolved in that order)
                    for a specific CSS property for the element
  * css(propname, value) - set a CSS property value for the element
  * position() - returns the client's bounding rect for the element. This function
                 breaks chaining. The object returned is a clientRect with properties
                 left, right, top, bottom, width, and height.
  * classes() - returns a function object for CSS class modifications. This function
                interrupts chaining, returning an object with functions: add(name),
                remove(name) and toggle(name). These functions resume chaining.
  * show(yesorno) - true = display:block, false = display:none
  * toggle() - flip between show() states
  * html() - get innerHTML
  * html(htmltext) set innerHTML
  * parent() - get element's extend()ed parentNode
  * add(child) - add one or more children to this element (more arguments = more children. null permitted)
  * remove() - remove this element from its parent. This function, obviously, breaks chaining.
  * remove(child) - remove child from this element
  * remove(int) - remove child number <int> from this element
  * clear() - remove all children for this element (does the same as .html(""), really)
  * get(attrname) - get attribute value for this element
  * set(attrname, value) - set an attribute value for this element
  * listenOnce(eventName, function) - let element listen to a specific event
                                      but unregister as listener after it triggers.
                                      You may add an optional third "useCapture" arg,
                                      but if you don't know what that means, don't.
  * listen(eventName, function) - make element a listener for the specified event.


### set API

When find(selector) matches multiple elements, you get a set instead of a single
element. This is different from jQuery. Sets have a slightly smaller API, since
functions that get values for single elements don't make sense for sets. These
functions chain unless otherwise indicated:

  * css(propname, value) - set CSS property value for all elements in the set.
  * show(yesorno) - show (or not) all elements
  * toggle() - toggle all elements
  * remove() - remove all elements from their parents. This function, obviously, does not chain.
  * listen(eventName, function) - make all elements listeners for the specified event
  * listenOnce(eventName, function) - idem ditto, but only once.
  * classes() - passthrough, use as .classes().add(name), .classes().remove(name), and
                .classes().toggle(name).

