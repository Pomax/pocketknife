/**

  This is a quick and dirty toolkit for HTLM element manipulation.
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

**/
(function(window, document, body){

  // don't overload
  if(window["Toolkit"]) return;

  /**
   * Toolkit object, for accessing the update() function
   */
  var Toolkit = {
    // runs when we create or template instantiate
    update: function(element) { return element; },
    // allows plugins to hook into the update process
    addUpdate: function(f) {
      var oldFn = this.update;
      this.update = function(element) {
        return f(oldFn(element));
      };
    }
  };

  // bind Toolkit object
  window["Toolkit"] = Toolkit;

  /**
   * set up a special CSS rule for hiding elements. Rather than change the
   * element's CSS properties, we simply tack this class onto any element
   * that needs to not be shown, or remove it to reveal the element again.
   */
  (function(){
    var ttkh = document.createElement("style");
    ttkh.type = "text/css";
    ttkh.innerHTML = ".tiny-toolkit-hidden{display:none!important;visibility:hidden!important;opacity:0!important;}";
    document.head.appendChild(ttkh); }());
  
  /**
   * synchronous ajax
   */
  var get = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET",url,false);
    xhr.send(null);
    // strip whitespace between close+open tags
    return xhr.responseText.replace(/>[\s\r\n]+</g,"><");
  }

  // 'does e exist?' evaluation function
  var exists = (function(X) { return function(t) { return (t!==X) && (t!==null); }}());

  // list of known templates
  var templates = {};

  /**
   * Insanely simple templating - replace {{moo}} with replacements.moo,
   * then use this template as the content for <element>.
   */
  var template = function(templateName, replacements) {
    if (!templates[templateName]) { templates[templateName] = get(templateName+".tpl.html"); }
    var replaced = templates[templateName], replacement;
    for(prop in replacements) {
      if(Object.hasOwnProperty(replacements, prop)) continue;
      replacement = replacements[prop];
      replaced = replaced.replace(new RegExp("{{"+prop+"}}",'g'), replacement); }
    return replaced;
  }

  /*
   * class list container, for modifying html element class attributes
   */
  var ClassList = function(owner) {
    this.element = owner;
    var classAttr = this.element.getAttribute("class");
    this.classes = (!classAttr ? [] : classAttr.split(/\s+/)); };

  /**
   * ClassList prototype: add(classname) and remove(classname)
   */
  ClassList.prototype = {
    element: {},
    classes: [],
    __update: function() {
      this.element.setAttribute("class", this.classes.join(" "));
    },
    add: function(clstring) {
      if(this.classes.indexOf(clstring)===-1) {
        this.classes.push(clstring); }
      this.__update();
      return this.element;
    },
    remove: function(clstring) {
      var pos = this.classes.indexOf(clstring);
      if(pos>-1) {
        this.classes.splice(pos, 1);
        this.__update(); }
      return this.element;
    }
  };

  // make sure the constructor points to the right thing
  ClassList.prototype.contstructor = ClassList;

  /**
   * extend HTML elements with a few useful (chainable) functions
   */
  var extend = function(e) {

    // shortcut: don't extend if element is nothing
    if(!exists(e)) return;

    // shorthand "try to bind" function
    var bind = function(e, name, func) { if(!exists(e[name])) { e[name] = func; }};
    
    /**
     * contextual finding
     */
    bind(e, "find", function(selector) {
      return find(e, selector);
    });
    
    /**
     * template loading
     */
    bind(e, "template", function(name,macros) {
      return Toolkit.update(e.html(template(name,macros)));
    });

    /**
     * get/set css properties
     */
    bind(e, "css", function(prop, val) {
      if(!val) {
        for(p in prop) {
          if(Object.hasOwnProperty(prop,p)) continue;
          e.css(p,prop[p]); }
        return e;
      }
      if(exists(val)) { e.style[prop] = val; return e; }
      return document.defaultView.getComputedStyle(e,null).getPropertyValue(prop) || e.style[prop];
    });
    
    /**
     * common dimensions
     */
    bind(e, "position", function() { return e.getBoundingClientRect(); });

    /**
     * HTML element class manipulation
     */
    bind(e, "classes", function() {
      if(!e.__clobj) { e.__clobj = new ClassList(e); }
      return e.__clobj;
    });

    /**
     * show/hide - note that this uses "block" by default.
     */
    bind(e, "show", function(yes, type) {
      if(yes) { e.classes().remove("tiny-toolkit-hidden"); } 
      else { e.classes().add("tiny-toolkit-hidden"); }
      return e;
    });

    bind(e, "toggle", function() {
      e.show(e.classes().contains("tiny-toolkit-hidden"));
      return e;
    });

    /**
     * get/set inner HTML
     */
    bind(e, "html", function(html) {
      if(exists(html)) {
        e.innerHTML = html;
        return e;
      }
      return e.innerHTML;
    });

    /**
     * get (extend()ed) parent
     */
    bind(e, "parent", function() {
      return extend(e.parentNode);
    });
    
    /**
     * add a child element
     */
    bind(e, "add", function() {
      for(var i=0, last=arguments.length; i<last; i++) {
        if(exists(arguments[i])) {
          e.appendChild(arguments[i]);
        }
      }
      return e;
    });

    /**
     * replace a child element, with logical old/new ordering
     */
    bind(e, "replace", function(o,n) {
      if(exists(o.parentNode)) {
        o.parentNode.replaceChild(n,o);
      }
      return n;
    });
    
    /**
     * remove self from parent, or child element (either by number or reference)
     */
    bind(e, "remove", function(a) {
      // remove self
      if(!a) { e.parentNode.removeChild(e); return; }
      // remove child by number
      if(parseInt(a)==a) { e.removeChild(e.children[a]); }
      // remove child by reference
      else{ e.removeChild(a); }
      return e;
    });

    /**
     * clear all children
     */
    bind(e, "clear", function() {
      while(e.children.length>0) {
        e.remove(e.get(0));
      }
      return e;
    });

    /**
     * get object property values
     */
    bind(e, "get", function(a) {
      if(a == parseInt(a)) {
        return extend(e.children[a]);
      }
      return e.getAttribute(a);
    });

    /**
     * set object property values
     */
    bind(e, "set", function(a,b) {
      if(!b) {
        for(prop in a) {
          if(!Object.hasOwnProperty(a,prop)) {
            e.setAttribute(prop,a[prop]);
          }
        }
      } else { e.setAttribute(a,b); }
      return e;
    });

    /**
     * One-time event listening
     * (with automatic cleanup)
     */
    bind(e, "listenOnce", function(s, f, b) {
      var _ = function() {
        e.removeEventListener(s, _, b|false);
        f.call(arguments);
      };
      e.addEventListener(s, _, b|false);
      return e;
    });

    /**
     * Permanent event listening
     */
    bind(e, "listen", function(s, f, b) {
      e.addEventListener(s, f, b|false);
      return e;
    });
    
    /**
     * homogenise with set API
     */
   e.foreach = function(f) { f(e); }

    // chaining return
    return e;
  };


  /**
   * API-extend this array for functions that make sense
   */
  var extendSet = function(elements) {

    // css: only setting
    elements["css"] = function(prop, val) {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i].css(prop,val); }
      return elements; };

    // show/toggle work normally
    elements["show"] = function(show, type) {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i].show(show, type); }
      return elements; };

    elements["toggle"] = function() {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i].toggle(); }
      return elements; };
    
    // remove each match from the dom -- return empty list
    elements["remove"] = function() {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i].remove(); }
      return []; };

    // listening: straight pass
    elements["listen"] = function() {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i]["listen"].apply(null,arguments); }
      return elements; };

    // listening: straight pass
    elements["listenOnce"] = function() {
      for(var i=0, last=elements.length; i<last; i++) {
        elements[i]["listenOnce"].apply(null,arguments); }
      return elements; };

    // and a plain foreach, for good measure
    elements.foreach = function(f) {
      for(var i=0, last=elements.length; i<last; i++) {
        f(elements[i]); }
      return elements; };

    // classes: add and remove only
    elements["classes"] = function() {
      if(!elements.__classes) {
        elements.__classes = {
          // set.classes().add(...)
          add: function(str) {
            for(var i=0, last=elements.length; i<last; i++) {
              elements[i].classes().add(str); }
            return elements; },
          // set.classes().remove(...)
          remove: function(str) {
            for(var i=0, last=elements.length; i<last; i++) {
              elements[i].classes().remove(str); }
            return elements; }};
      }
      return elements.__classes; };
    
    // chaining return
    return elements;
  };

  /**
   * The thing that makes it all happen
   */
  var find = function(context, selector) {
    var nodeset = context.querySelectorAll(selector),
        elements = [];
    if(nodeset.length==0) return {foreach:function(){}};
    // single?
    if(nodeset.length==1) { return extend(nodeset[0]); }
    // multiple results
    for(var i=0, last=nodeset.length; i<last; i++) {
      elements[i] = extend(nodeset[i]); }
    return extendSet(elements);
  };

  /**
   * extend document and body, since they're just as HTML-elementy as everything else
   */
  extend(document).listenOnce("DOMContentLoaded", function() { extend(body); });

  /**
   * universal toolkit extend function
   */
  window["extend"] = extend;

  /**
   * universal document.createElement()
   */
  window["create"] = function(e) {
    var c = extend(document.createElement(e));
    return Toolkit.update(c); };

  /**
   * univeral element selector
   */
  window["find"] = function(selector) { return find(document,selector); };
  
  /**
   * turn a template into a DOM fragment
   */
  window["template"] = function(name, macros) {
    return Toolkit.update(extend(create("div").template(name, macros).children[0]));
  }

}(window,document,document.body));