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

  /**
   * universal slider repositioning
   */
  var reposition = function(rails, slider, evt) {
    if(rails.disabled) return; 
    var x = evt.clientX,
        min = rails.position().left,
        max = rails.position().right-slider.position().width,
        oldval = parseFloat(rails.get("value"));
    if(min<=x && x<=max) {
      x -= min;
      var ncmin = parseFloat(rails.get("min")),
          ncmax = parseFloat(rails.get("max")),
          ratio = x/(max-min),
          value = ""+(ncmin + ratio*(ncmax-ncmin));
      if(value===oldval) return;
      slider.css("left", parseInt(1000*(value-ncmin)/(ncmax-ncmin))/10 + "%");
      rails.set("value",value);
      slider.set("title",value);
      if(rails.onchange) {
        rails.onchange({value: value});
      }
    };
  };

  // input type="range" --> custom slider replacement
  var substitute = function(input) {
    var props = {
          disabled: false,
          type: "range",
          min: input.get("min") || "0",
          max: input.get("max") || "100",
          step: input.get("step") || "1",
          value: input.get("value") || "0"
        },
        rails = create("div", props);

    if(input.id) rails.id = input.id;
    if(input.get("class")) rails.set("class",input.get("class"));
    if(input.get("style")) rails.set("style",input.get("style"));
    if(input.onchange) { rails.onchange = input.onchange; }
    rails.classes().add("tiny-toolkit-input-type-range");

    var slider = create("span").classes().add("tiny-toolkit-input-type-range-slider");
    rails.add(slider);

    // prevent text-selection UX
    slider.onselectstart = function () { return false; }
    slider.onmousedown = function () { return false; }
    rails.onselectstart = function () { return false; }
    rails.onmousedown = function () { return false; }

    // reposition is actually handled by the rails
    rails.listen("mousemove", function(evt){
      if(rails.get("sdown")) {
        reposition(rails, slider, evt);
      }
    });

    rails.listen("mousedown", function(evt){
      if(evt.which===1 || evt.button===1) {
        rails.set("sdown",true);
        reposition(rails, slider, evt);
        return false;
      }
    });

    window.document.listen("mouseup", function(evt){
      rails.set("sdown","");
    });

    // make sure the slider starts at the right position
    // before returning the substitution element.
    if(props.value!=="0") {
      var mn = parseFloat(props.min),
          mx = parseFloat(props.max),
          v = parseFloat(props.value);
      slider.css("left", (100*(v-mn)/(mx-mn)) + "%"); }

    // enable/disable is always useful
    rails.disable = function() {
      rails.disabled = true;
      rails.classes().add("hidden");
      slider.classes().add("hidden");
    };
    rails.enable = function() {
      rails.disabled = false;
      rails.classes().remove("hidden");
      slider.classes().remove("hidden");
    };
    return rails;
  }

  // take input element, hijack set() so that (type,range)
  // triggers a replacement, IF the element is in the DOM.
  var inputExtend = function(input) {
    var atfn = input["set"];
    input["set"] = function(name, value) {
      // only intercept type=range
      if(name!=="type" || value!=="range") {
        return atfn(name, value);
      }

      // perform substitution
      var parent = input.parent();
      if(parent) {
        parent.replace(input, substitute(input));
      }
    }
  };

  // see if we need to input-extend an element
  var tryExtend = function(element) {
    if(element.nodeName.toLowerCase==="input") {
      inputExtend(element);
      if(element.get("type") === "range") {
        return element.set("type","range");
      }
    } else {
      replaceAllInputRanges(element);
    }
    return element;
  };

  // general <input type="range"> replacement
  var replaceAllInputRanges = function(ctx) {
    var context = ctx || window;
    context.find("input[type=range]").do(function(e) {
      if(e.parent()) {
        e.parent().replace(e, substitute(e));
      }
    });
  }

  // make globally available
  window["Toolkit"].addUpdate(function(element) {
    return tryExtend(element);
  });

// ---

  // trigger replacement on DOM ready
  document.listenOnce("DOMContentLoaded", replaceAllInputRanges);

}(window));