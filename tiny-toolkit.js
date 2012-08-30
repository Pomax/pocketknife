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
    update: function(element) {
      return element;
    },

    // allows plugins to hook into the update process
    addUpdate: function(f) {
      var oldFn = this.update;
      this.update = function(element) {
        return f(oldFn(element));
      };
    }
  };

  /**
   * bind Toolkit object
   */
  window["Toolkit"] = Toolkit;

  /**
   * universal toolkit extend function
   */
  window["extend"] = extend;

  /**
   * universal document.createElement()
   */
  window["create"] = function(e,a,i) {
    var c = extend(document.createElement(e));
    // element attributes
    if(a) {
      for(p in a) {
        if(Object.hasOwnProperty(a,p)) continue;
        c.setAttribute(p, a[p]);
      }
    }
    // element innerHTML
    if(i) { c.innerHTML = i; }
    return Toolkit.update(c);
  };

  /**
   * synchronous ajax
   */
  var getTPL = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET",url,false);
    xhr.send(null);
    // strip whitespace between close+open tags
    return xhr.responseText.replace(/>[\s\r\n]+</g,"><");
  };

  // 'does e exist?' evaluation function
  var exists = (function(X) {
    return function(t) {
      return (t!==X) && (t!==null);
    }
  }());

  // list of known templates
  var templates = {};

  /**
   * Insanely simple templating - replace {{moo}} with replacements.moo,
   * then use this template as the content for <element>.
   * Conditionals are supported mustache-style, so {{#name}}when exists{{/name}}
   */
  var template = function(templateName, replacements) {
    if (!templates[templateName]) {
      templates[templateName] = getTPL(templateName+".tpl.html");
    }

    var replaced = templates[templateName], replacement,
        props = [], i, last=0, prop,
        RE = new RegExp("{{#([^}]+)}}((\n|.)*?){{\\/\\1}}",'g'), match;

    // preprocess: conditional blocks
    while(match = RE.exec(replaced)) {
      props.push(match[1]); last++;
    }

    for(i=0; i<last; i++) {
      prop = props[i];
      RE = new RegExp("{{#"+prop+"}}((\n|.)*?){{\\/"+prop+"}}",'g');
      // known property: unwrap for substitution
      if(exists(replacements[prop])) { replaced = replaced.replace(RE, "$1"); }
      // unknown property: remove entire block
      else { replaced = replaced.replace(RE, ''); }
    }

    // then perform real substitutions
    for(prop in replacements) {
      if(Object.hasOwnProperty(replacements, prop)) continue;
      replacement = replacements[prop];
      replaced = replaced.replace(new RegExp("{{"+prop+"}}",'g'), replacement);
    }
    return replaced;
  }

  /*
   * class list container, for modifying html element class attributes
   */
  var ClassList = function(owner) {
    var classAttr = owner.getAttribute("class");
    var classes = (!classAttr ? [] : classAttr.split(/\s+/));
    var __update = function() {
      owner.setAttribute("class", classes.join(" "));
    };
    this.add = function(clstring) {
      if(classes.indexOf(clstring)===-1) { classes.push(clstring); }
      __update();
      return owner;
    };
    this.remove = function(clstring) {
      var pos = classes.indexOf(clstring);
      if(pos>-1) { classes.splice(pos, 1); __update(); }
      return owner;
    };
    this.contains = function(clstring) {
      return (classes.indexOf(clstring) !== -1);
    };
  };

  // shorthand "try to bind" function
  var bind = function(e, name, func) {
    if(!exists(e[name])) {
      e[name] = func;
    }
  };

  /**
   * extend HTML elements with a few useful (chainable) functions
   */
  var extend = function(e) {

    // shortcut: don't extend if element is nothing
    if(!exists(e)) return;

    // shortcut 2: don't extend if extended
    if(exists(e["__ttk_extended"])) return e;

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
      if(val && val!=="") { e.style[prop] = val; return e; }
      if(val==="") {
        var s = e.get("style");
        if(s) {
          s = s.replace(new RegExp(prop+"\\s*:\\s*"+val,''),'');
          e.set("style",s); 
        }
        return e; 
      }
      if(!val && typeof prop === "object") {
        for(p in prop) {
          if(Object.hasOwnProperty(prop,p)) continue;
          e.css(p,prop[p]); }
        return e;
      }
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
      if(!e.__ttk_clobj) {
        e.__ttk_clobj = new ClassList(e);
      }
      return e.__ttk_clobj;
    });

    /**
     * show/hide
     */
    bind(e, "show", function(yes) {
      console.log(yes);
      if(yes) { e.set("data-tiny-toolkit-hidden",""); }
      else { e.removeAttribute("data-tiny-toolkit-hidden"); }
      return e;
    });

    bind(e, "toggle", function() {
      e.show(!exists(e.get("data-tiny-toolkit-hidden")));
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
      if(!exists(b)) {
        for(prop in a) {
          if(!Object.hasOwnProperty(a,prop)) {
            e.setAttribute(prop,a[prop]);
          }
        }
      }
      else { e.setAttribute(a,b); }
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
    bind(e, "do", function(f) { f(e); return e; });

    // chaining return
    e["__ttk_extended"] = true;
    return e;
  };

  // shorthand passthrough function
  var passThrough = function(elements, ns, functor, arguments) {
    for(var i=0, last=elements.length; i<last; i++) {
      extend(exists(ns) ? elements[i][ns]() : elements[i])[functor].apply(elements[i], arguments);
    }
    return elements;
  };

  // used in extendSet and find
  var emptySet = [], noop = function() { return emptySet; };
  emptySet["classes"] = { add: noop, remove: noop };
  emptySet["remove"] = noop;
  emptySet["do"] = noop;

  /**
   * API-extend this array for functions that make sense
   */
  var extendSet = function(elements) {
    // passthrough functions
    var passThroughList = ["css", "show", "toggle", "set", "listen", "listenOnce"],
        last = passThroughList.length, i, term;

    // set up all passthroughs
    for(i=0; i<last; i++) {
      term = passThroughList[i];
      elements[term] = (function(functor) {
        return function() {
          return passThrough(elements, null, functor, arguments);
        };
      }(term));
      emptySet[term] = noop;
    }

    // passthrough with explicit namespace for classes
    var classobj = {
      add: function() {
        return passThrough(elements, "classes", "add", arguments);
      },
      remove: function() {
        return passThrough(elements, "classes", "remove", arguments);
      }
    };

    elements["classes"] = function() {
      return classobj;
    };

    // passthrough, but return empty list
    elements["remove"] = function() {
      passThrough(elements, "remove", arguments); return emptySet;
    };

    // different kind of pass-through
    elements["do"] = function(f) {
      for(var i=0, last=elements.length; i<last; i++) {
        f(elements[i]);
      }
      return elements;
    };

    // chaining return
    return elements;
  };

  /**
   * The thing that makes it all happen
   */
  var find = function(context, selector) {
    var nodeset = context.querySelectorAll(selector),
        elements = [];
    if(nodeset.length==0) return emptySet;
    // single?
    if(nodeset.length==1) { return extend(nodeset[0]); }
    // multiple results
    for(var i=0, last=nodeset.length; i<last; i++) {
      elements[i] = extend(nodeset[i]); }
    return extendSet(elements);
  };

  /**
   * set up a special CSS rule for hiding elements. Rather than change the
   * element's CSS properties, we simply tack this attribute onto any element
   * that needs to not be shown, or remove it to reveal the element again.
   */
  (function(){
    var ttkh = create("style", {type: "text/css"}, "*[data-tiny-toolkit-hidden]{display:none!important;visibility:hidden!important;opacity:0!important;}");
    document.head.appendChild(ttkh); }());

  /**
   * extend document and body, since they're just as HTML-elementy as everything else
   */
  extend(document).listenOnce("DOMContentLoaded", function() { extend(body); });

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