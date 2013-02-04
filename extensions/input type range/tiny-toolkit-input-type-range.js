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
  // triggers a replacement, IF the element is in the DOM.
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
  function reposition(rails, slider, evt) {
    if (rails.get("disabled") === "disabled") return;
    var x = evt.clientX,
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

    console.log(ncmin + ", " + ncmax + ", " + step + ", " + ratio + ", " + value);

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

    // prevent text-selection UX
    slider.onselectstart = function () { return false; };
    slider.onmousedown   = function () { return false; };
    rails.onselectstart  = function () { return false; };
    rails.onmousedown    = function () { return false; };

    // reposition is actually handled by the rails
    rails.listen("mousedown", function(evt){
      if (evt.which === 1 || evt.button === 1) {
        rails.set("sdown", true);
        reposition(rails, slider, evt);
        return false;
      }
    });

    // but when the mouse is down, response is
    // handled by the document.
    document.listen("mousemove", function(evt) {
      if (rails.get("sdown") === "true") {
        reposition(rails, slider, evt);
      }
    });

    document.listen("mouseup", function(evt) {
      rails.set("sdown", false);
    });

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
      rails.classes().add("hidden");
      slider.classes().add("hidden");
    };
    rails.enable = function() {
      rails.set("disabled","");
      rails.classes().remove("hidden");
      slider.classes().remove("hidden");
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

  // trigger replacement on DOM ready
  document.listenOnce("DOMContentLoaded", replaceAllInputRanges);

}(window));