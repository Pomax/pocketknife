/**
  A Tiny Toolkit extension that makes all browsers do the
  same thing for <input type="range"> elements. It replaces
  them with a <div> rail and <span> slide head. The attribute
  API is the same as for <input type="range">, but the only
  JavaScript event offered is onchange. It'll do a full
  document replacement on DOMContentLoaded, and shims toolkit
  so that create("input") will lead to a replacement when
  .set("type","range") is called -- it also extends the
  Toolkit.update() function so that any stray <input type="range">
  elements are converted when update is called.
**/
(function(window) {

  // is toolkit loaded?
  if(!window["Toolkit"]) return;

  // take input element, hijack set() so that (type,range)
  // triggers a replacement, *IF* the element is in the DOM.
  (function($) {
    var originalSetAttribute = $.setAttribute;
    $.setAttribute = function(name, value) {
      // only intercept type=range
      if (name !== "type" || value !== "range") {
        return originalSetAttribute.apply(this, [name, value]);
      }
      // perform substitution
      if (this.parent()) {
        this.replace(substitute(this));
      }
    }
  }(HTMLInputElement.prototype));

  /**
   * universal slider repositioning
   */
  function reposition(rails, slider, options) {
    if (rails.get("disabled") === "disabled") return;
    var x = options.screenX,
        rpos = rails.position(),
        min = rpos.left,
        max = rpos.right - slider.position().width,
        oldval = parseFloat(rails.get("value"));
    if (min <= x && x <= max) {
      x -= min;
      var ncmin = parseFloat(rails.get("min")),
          ncmax = parseFloat(rails.get("max")),
          step = parseFloat(rails.get("step")),
          ratio = x / (max - min),
          value = ncmin + step*(Math.round(ratio * (ncmax - ncmin) / step));
      if (value > ncmax || value === oldval) return;
      oldval = value;
      slider.css("left", parseInt(1000 * (value - ncmin) / (ncmax-ncmin)) / 10 + "%");
      slider.set("title",value);
      rails.set("value",value);
      if (rails.onchange) {
        rails.onchange({value: value});
      }
    };
  };

  // input type="range" --> custom slider replacement
  function substitute(input) {
    if(!exists(input)) return;
    var props = {
          disabled: false,
          type: "range",
          id: input.id || "",
          min: input.get("min") || "0",
          max: input.get("max") || "100",
          step: input.get("step") || "1",
          value: input.get("value") || "0",
          "class": input.get("class") || "",
          "style": input.get("style") || ""
        },
        rails = create("div", props);
    if (input.onchange) { rails.onchange = input.onchange; }
    rails.classes().add("tiny-toolkit-input-type-range");

    var slider = create("span", {"class":"tiny-toolkit-input-type-range-slider"});
    slider.set("title", props.value);
    rails.add(slider);

    rails.set = (function(rails){
      var oldSet = rails.set;
      return function(a,b) {
        var ret = oldSet.call(rails,a,b);
        if(["min","max","value"].indexOf(a)!==-1) {
          var mn = rails.get("min"),
              mx = rails.get("max"),
              v = rails.get("value");
          slider.css("left", (100 * (v - mn) / (mx - mn)) + "%");
        }
        return ret;
      };
    }(rails));

    // prevent text-selection UX
    slider.onselectstart = function () { return false; };
    slider.onmousedown   = function () { return false; };
    rails.onselectstart  = function () { return false; };
    rails.onmousedown    = function () { return false; };

    // reposition is actually handled by the rails
    var touchlock = false,
        lastTouch = -1,
        engageRails = function(evt){
          if (evt.which === 1 || evt.button === 1) {
            rails.set("sdown", true);
            reposition(rails, slider, {screenX: evt.screenX});
            return false;
          }
        };

    rails.listen("mousedown", function(evt) {
      if (touchlock) return;
      return engageRails(evt);
    });

    rails.listen("touchstart", function(evt) {
      touchlock = true;
      evt.which = evt.button = 1;
      evt.screenX = evt.touches.item(0).screenX;
      return engageRails(evt);
    }),

    // but when the mouse is down, response is handled by the document.
    document.listen("mousemove", function(evt) {
      if (touchlock) return;
      if (rails.get("sdown") === "true") {
        reposition(rails, slider, evt);
      }
    });

    document.listen("touchmove", function(evt) {
      var now = (new Date()).getTime();
      if (touchlock && lastTouch===-1 && rails.get("sdown") === "true") {
        evt.screenX = evt.touches.item(0).screenX;
        reposition(rails, slider, evt);
        lastTouch = now;
      } else {
        if(now-lastTouch>100) {
          lastTouch = -1;
        }
      }
    })

    document.listen("mouseup", function(evt) {
      if (touchlock) return;
      rails.set("sdown", false);
    });

    document.listen("touchend", function(evt) {
      rails.set("sdown", false);
      touchlock = false;
      lastTouch = -1;
    })

    // make sure the slider starts at the correct position
    // before returning the substitution element.
    if (props.value !== "0") {
      var mn = parseFloat(props.min),
          mx = parseFloat(props.max),
          v = parseFloat(props.value);
      slider.css("left", (100 * (v - mn) / (mx - mn)) + "%");
    }

    // enable/disable is always useful
    rails.disable = function() {
      rails.set("disabled","disabled");
      rails.show(false);
      slider.show(false);
    };

    rails.enable = function() {
      rails.set("disabled",false);
      rails.show(true);
      slider.show(true);
    };
    return rails;
  }

  // bind to toolkit
  window["Toolkit"].substitute = substitute;

  // general <input type="range"> replacement
  var replaceAllInputRanges = function(ctx) {
    var context = ctx || window;
    context.find("input[type=range]").forEach(function(e) {
      if(exists(e) && e.parent()) {
        e.parent().replace(e, substitute(e));
      }
    });
  }

  // trigger replacements now, and on DOM ready
  replaceAllInputRanges();
  document.listenOnce("DOMContentLoaded", replaceAllInputRanges);

}(window));
