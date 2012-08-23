// modifies create() to intercept <input type="range">
(function(window) {

  if(!window["create"]) return;

  // cache
  var oldfn = window["create"];
  
  // new create() function
  window["create"] = function(tag) {
    var _tmp = oldfn(tag);
    if(tag==="input") {
      
      // input elements get a check on their setAttribute method
      var atfn = _tmp["set"];
      _tmp["set"] = function(name, value) {
        if(name!=="type" || value!=="range") {
          return atfn(name, value);
        }
        // intercept
        var parent = _tmp.parent();
        var rails = create("div");
        if(_tmp.id) rails.id = _tmp.id;
        if(_tmp.get("class")) rails.set("class",_tmp.get("class"));
        if(_tmp.get("style")) rails.set("style",_tmp.get("style"));
        rails.set("type","range");
        rails.set("min","0");
        rails.set("max","100");
        rails.set("step","1");
        rails.set("value","0");
        rails.classes().add("tiny-toolkit-input-type-range");
        var slider = create("span").classes().add("tiny-toolkit-input-type-range-slider");
        parent.replaceChild(rails, _tmp);
        rails.add(slider);
        var sdown = false;
        var reposition = function(rails, slider, evt) {
          var x = evt.clientX,
              min = rails.position().left,
              max = rails.position().right-slider.position().width;
          if(min<=x && x<=max) {
            x -= min;
            var ncmin = parseFloat(rails.get("min")),
                ncmax = parseFloat(rails.get("max")),
                ratio = x/(max-min),
                value = ""+(ncmin + ratio*(ncmax-ncmin));
            slider.css("left", x + "px");
            rails.set("value",value);
            if(rails.onchange) {
              rails.onchange({value: value});
            }
          };
        }
        // reposition is actually handled by the rails
        rails.listen("mousemove", function(evt){ if(sdown) { reposition(rails, slider, evt); }});
        rails.listen("click", function(evt){ reposition(rails, slider, evt); });
        // prevent text-selection UX
        slider.onselectstart = function () { return false; }
        slider.onmousedown = function () { return false; }
        // "should reposition" flag
        slider.listen("mousedown", function(evt){ sdown = true; });
        window.document.listen("mouseup", function(evt){ sdown = false; });
      }
    }
    return _tmp;
  }

}(window));