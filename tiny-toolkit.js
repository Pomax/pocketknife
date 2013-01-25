/**

  This is a tiny "I don't need the full jQuery API"
  toolkit. It has a small API, and acts more as a
  JS API enrichment than a "library". You don't call
  functions on $ or Toolkit or something, you just
  call functions in global scope or on HTML elements
  and arrays. If that seems bad, don't use this.

  Current state: requires code consolitation in Array and HTMLElement prototypes

**/
(function(_w, _d){

  /**
   * Toolkit object, for accessing the update() function
   */
  var Toolkit = {
    version: [2013, 1, 24, 15, 26],
    newerThan: function(other) {
      var v = "version";
          v1 = this[v],
          v2 = other[v],
          len = v1.length;
      for (var pos = 0; pos < len; pos++) {
        if (v1[pos] > v2[pos]) {
          return true;
        }
      }
      return false;
    }
  };

  // First, do a version check. Something might have
  // tried to load another tiny toolkit library.
  if(_w["Toolkit"] && _w["Toolkit"].newerThan(Toolkit)) return;

  // No conflict, or this version is newer: continue initialising.
  (function(toolkit) {
    toolkit.append = function(name, fn) {
      this[name] = fn;
    };
  }(Toolkit));

  /**
   * bind Toolkit object
   */
  _w["Toolkit"] = Toolkit;

  /**
   * Also set up a "does thing exist?" evaluation function
   */
  _w["exists"] = (function(undef) {
    return function(thing) {
      return (thing !== undef) && (thing !== null);
    }
  }());

  /**
   * Extend window so that there is a "create" function that we
   * can use instead of the limited document.createElement().
   */
  _w["create"] = function(tagname, attributes, content) {
    var element = _d.createElement(tagname);
    // element attributes
    if(typeof attributes == "object") {
      for(property in attributes) {
        if(Object.hasOwnProperty(attributes,property)) continue;
        element.setAttribute(property, attributes[property]);
      }
    }
    if (typeof attributes === "string") { content = attributes; }
    if(content) { element.innerHTML = content; }
    return element;
  };

  /**
   * First off, we replace querySelector/querySelectorAll with "find".
   * In part to homogenise the API, in part because NodeList is an
   * utterly useless thing to work with, compared to arrays.
   */
  var find = function(context, selector) {
    var nodelist = context.querySelectorAll(selector),
        elements = [];
    if (nodelist.length == 0) {
      return [];
    }
    if (nodelist.length == 1) {
      return nodelist[0];
    }
    for(var i = 0, last = nodelist.length; i < last; i++) {
      elements[i] = nodelist[i];
    }
    return elements;
  };

  /**
   * The global implementation of "find" uses the current document.
   */
  _w.find = function(selector) { return find(_d, selector); };


/*************************************************************************

  The API, callable on both HTML elements and arrays:

      find, html, position,
      css, show, toggle,
      classes().{add, remove, contains},
      parent, add, replace, remove, clear,
      get, set,
      listen, listenOnce,
      forEach


*************************************************************************/


  var hiderule = "data-tiny-toolkit-hidden";
  var classesName = "内のclasses";


/*************************************************************************/

  /**
   * No browsers offers a simple way to find out which functions will
   * fire on an element, and for which event. Let's change that.
   */
  var EventListeners = function(owner) {
    this.owner = owner;
    this.events = [];
    this.listeners = {};
  }
  EventListeners.prototype = {
    record: function(evt, fn) {
      this.events.pushUnique(evt);
      if (!exists(this.listeners[evt])) {
        this.listeners[evt] = [];
      }
      this.listeners[evt].push(fn);
    },
    forget: function(evt, fn) {
      var pos = this.listeners[evt].indexOf(fn);
      this.listeners[evt].splice(pos, 1);
    }
  };

  /**
   * Not all browsers support .classList, and even those that do
   * don't let us decorate them to make them chaining functions,
   * so: too bad, so sad, and we implement our own class list.
   */
  var ClassList = function(owner) {
    this.owner = owner;
    var classAttr = owner.getAttribute("class");
    this.classes = (!classAttr ? [] : classAttr.split(/\s+/));
  };

  ClassList.prototype = {
    classes: [],
    update: function() {
      if(this.classes.length === 0) { this.owner.removeAttribute("class"); }
      else { this.owner.setAttribute("class", this.classes.join(" ")); }
    },
    add: function(clstring) {
      if(this.classes.indexOf(clstring)===-1) {
        this.classes.push(clstring);
      }
      this.update();
      return this.owner;
    },
    remove: function(clstring) {
      var pos = this.classes.indexOf(clstring);
      if(pos>-1) {
        this.classes.splice(pos, 1);
        this.update();
      }
      return this.owner;
    },
    contains: function(clstring) {
      return (this.classes.indexOf(clstring) !== -1);
    }
  };

  /**
   * We need to make sure that from a user perspective,
   * the difference between "array" and "single element"
   * is irrelevant. This means homogenizing the Array
   * and HTMLElement prototypes. Yes, prototype pollution,
   * because we want to install our library, not "use" it.
   */
  (function($){
    // public helper for "add only if not already added"
    $.pushUnique = function(e) { if(this.indexOf(e) === -1) { this.push(e); }};
    // public helper for "do any of the elements in this array pass this test"
    $.test = function(f) {
      var i, len=this.length;
      for(i=0; i<len; i++) {
        if(f(this[i])) return true;
      }
      return false;
    };
    // cache the original forEach function
    $["元のforEach"] = $.forEach;
    // then make forEach() a chaining function
    $.forEach = function(fn) {
      this["元のforEach"](fn);
      return this;
    }
    // API implementation
    $.classes = function() {
      if(!this[classesName]) {
        this[classesName] = {};
        var arr = this;
        ["add","remove"].forEach(function(fn) {
          arr[classesName][fn] = function() {
            var input = arguments, classes;
            arr.forEach(function(e) {
              classes = e.classes();
              classes[fn].apply(classes,input);
            });
            return arr;
          }
        });
        this[classesName].contains = function() {
          var input = arguments, classes;
          return arr.test(function(e) {
            classes = e.classes();
            return classes.contains.apply(classes,input);
          });
        };
      }
      return this[classesName];
    };
    // functions that will end up applying only to the first element:
    ["add", "replace"].forEach(function(fn){
      $[fn] = function() {
        var e = this[0];
        return e[fn].apply(e, arguments);
      };
    });
    // functions that get applied to all elements, returning the array:
    ["show", "toggle", "set", "remove", "clear", "listen", "listenOnce"].forEach(function(fn){
      $[fn] = function() {
        var input = arguments;
        this.map(function(e) {
          e[fn].apply(e, input);
        });
        return this;
      };
    });
    // aggregating functions with the same aggregation shape:
    ["find", "parent"].forEach(function(fn) {
      $[fn] = function() {
        var results = [];
        this.forEach(function(e) {
          e[fn].apply(e,arguments).forEach(function(r) {
            results.pushUnique(r);
          });
        });
        return results;
      };
    });
    // functions that get applied to all elements, returning the array-of-results:
    ["position", "html", "css", "get"].forEach(function(fn) {
      $[fn] = function() {
        var result = [];
            input = arguments;
        this.forEach(function(e) {
          result.push(e[fn].apply(e, input));
        });
        return result;
      };
    });
  }(Array.prototype));


  /**
   * Extend the HTMLElement prototype.
   */
  (function($, find){
    // This lets us call forEach irrespective of whether we're
    // dealing with an HTML element or an array of HTML elements:
    $.forEach = function(fn) {
      fn(this);
      return this;
    }
    $.find = function(selector) {
      return find(this, selector);
    };
    $.css = function(prop, val) {
      if(typeof val === "string") {
        this.style[prop] = val;
        if (this.get("style") === "") {
          this.set("style", "");
        }
        return this;
      }
      if(!val && typeof prop === "object") {
        for(p in prop) {
          if(Object.hasOwnProperty(prop,p)) continue;
          this.css(p,prop[p]); }
        return this;
      }
      return getComputedStyle(this).getPropertyValue(prop) || this.style[prop];
    };
    $.position = function() {
      return this.getBoundingClientRect();
    };
    $.classes = function() {
      if(!this[classesName]) {
        this[classesName] = new ClassList(this);
      }
      return this[classesName];
    };
    $.show = function(yes) {
      if(yes) { this.removeAttribute(hiderule); }
      else { this.setAttribute(hiderule,""); }
      return this;
    };
    $.toggle = function() {
      this.show(_w.exists(this.get(hiderule)));
      return this;
    };
    $.html = function(html) {
      if(_w.exists(html)) {
        this.innerHTML = html;
        return this;
      }
      return this.innerHTML;
    };
    $.parent = function() {
      return this.parentNode;
    };
    $.add = function() {
      for(var i=0, last=arguments.length; i<last; i++) {
        if(_w.exists(arguments[i])) {
          this.appendChild(arguments[i]);
        }
      }
      return this;
    };
    $.replace = function(o,n) {
      if(_w.exists(o.parentNode) && _w.exists(n)) {
        o.parentNode.replaceChild(n,o);
        return n;
      }
      this.parentNode.replaceChild(o,this);
      return o;
    };
    $.remove = function(c) {
      // remove self
      if(!_w.exists(c)) { this.parentNode.removeChild(this); }
      // remove child by number
      else if(parseInt(c)==c) { this.removeChild(this.children[c]); }
      // remove child by reference
      else if(c.parentNode && c.parentNode === this) { this.removeChild(c); }
      return this;
    };
    $.clear = function() {
      while(this.children.length>0) {
        this.remove(this.get(0));
      }
      return this;
    };
    $.get = function(a) {
      if(a == parseInt(a)) {
        return this.children[a];
      }
      return this.getAttribute(a);
    };
    $.set = function(a,b) {
      if(!_w.exists(b)) {
        for(prop in a) {
          if(!Object.hasOwnProperty(a, prop)) {
            this.setAttribute(prop, a[prop]);
          }
        }
      }
      else if (b === "") { this.removeAttribute(a); }
      else { this.setAttribute(a, b); }
      return this;
    };

    $.eventListeners = false;
    $["元のaddEventListener"] = $.addEventListener;
    $.addEventListener = function() {
      $["元のaddEventListener"].apply(this, arguments);
      if(!this.eventListeners) {
        this.eventListeners = new EventListeners(this);
      }
      this.eventListeners.record(arguments[0], arguments[1]);
    };
    $["元のremoveEventListener"] = $.removeEventListener;
    $.removeEventListener = function() {
      $["元のremoveEventListener"].apply(this, arguments);
      this.eventListeners.forget(arguments[0], arguments[1]);
    };
    $.listen = function(s, f, b) {
      this.addEventListener(s, f, b|false);
      return this;
    };
    $.listenOnce = function(s, f, b) {
      var e = this, _ = function() {
        e.removeEventListener(s, _, b|false);
        f.call();
      };
      this.addEventListener(s, _, b|false);
      return this;
    };
  }(HTMLElement.prototype, find));

  /**
   * In order for show() to be reliable, we don't want to intercept style.display.
   * Instead, we use a special data attribute that regulates visibility. Handy!
   */
  (function(dataAttr){
    var rules = ["display:none!important", "visibility:hidden!important","opacity:0!important"],
        rule  = "*["+dataAttr+"]{" + rules.join(";") + "}",
        sheet = _w.create("style", {type: "text/css"}, rule);
    _d.head.add(sheet);
  }(hiderule));

}(window, document));