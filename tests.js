var hiderule = "data-pocketknife-hidden";

// IE and Safari don't support .click() on elements. Simulate using faked event.
function simulatedClick(target) {
  var t = (target===document ? document : target.ownerDocument);
  var view = t.defaultView;
  var event = t.createEvent("MouseEvents");
  event.initMouseEvent("click",true,true,view,1,0,0,0,0,false,false,false,false,1,null);
  target.dispatchEvent(event);
}

/**
 * global tests
 */
test( "exists(x) test", function() {
  // these things should exist, because they do:
  ok(exists(true), "<true> exists");
  ok(exists(123), "positive number exists");
  ok(exists(-123), "negative number exists");
  ok(exists("abc"), "string primitive exists");
  ok(exists([]), "new array exists");
  ok(exists({}), "new objectexists");
  ok(exists(function(){}), "throw-away function exists");
  // these things should exist, despite coercing to false:
  ok(exists(0), "0 exists");
  ok(exists(false), "false exists");
  ok(exists(NaN), "NaN exists");
  ok(exists(""), "empty string exists");
  // these things should not exist:
  ok(!exists(), "<empty> does not exist");
  ok(!exists(undefined), "undefined does not exist");
  ok(!exists(null), "null does not exist");
});

/**
 * HTMLElement tests
 */
test( "HTML Element length property", function() {
  var p = create("p");
  ok(p.length === 1, "HTMLElement has length 1");
});

test( "test create/1", function() {
  var p = create("p");
  ok(p instanceof HTMLElement, "created element is an HTMLElement");
  equal(p.nodeName, "P", "created element has the correct node name");
});

test( "test create/2 - attributes", function() {
  var p = create("p", {"style":"background-color: red;"});
  equal(p.getAttribute("style"), "background-color: red;", "element has attribute");
});

test( "test create/2 - content", function() {
  var p = create("p", "lol");
  equal(p.innerHTML, "lol", "element has correct content");
});

test( "test create/3", function() {
  var p = create("p", {"style":"background-color: red;"}, "lol");
  equal(p.innerHTML, "lol", "element has correct content");
  equal(p.getAttribute("style"), "background-color: red;", "element has attribute");
});

test( "find for non-matching selector (result is empty)", function() {
  var cats = find("lolcats");
  ok(cats instanceof Array, "result is an array");
  equal(cats.length, 0, "result has length 0");
});

test( "find for single-matching selector", function() {
  var body = find("body");
  ok(body instanceof HTMLElement, "body is an HTMLElement");
  equal(body.nodeName, "BODY", "body has the correct tag");
});

test( "find for multiple-matching selector", function() {
  var div = create("div");
  div.add(create("p"));
  div.add(create("p"));
  div.add(create("p"));
  div.add(create("p"));
  div.add(create("p"));
  var results = div.find("p");
  ok(results instanceof Array, "result is an array");
  equal(results.length, 5, "result has the correct number of matched elements");
});

test( "add", function() {
  var div= create("div");
  var p = create("p");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
});

test( "add/n", function() {
  var div= create("div");
  var p1 = create("p");
  var p2 = create("p");
  var p3 = create("p");
  var p4 = create("p");
  var p5 = create("p");
  div.add(p1, p2, p3, p4, p5);
  equal(div.children.length, 5, "element has fiver children after inserting <p>");
  equal(div.children[0], p1, "element is indeed the intended <p>");
});

test( "remove/0", function() {
  var div= create("div");
  var p = create("p");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
  p.remove();
  equal(div.children.length, 0, "element has no children after p.remove()");
});

test( "remove/1 - by id", function() {
  var div= create("div");
  var p = create("p");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
  div.remove(0);
  equal(div.children.length, 0, "element has no children after div.remove(0)");
});

test( "remove/1 - by child", function() {
  var div= create("div");
  var p = create("p");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
  div.remove(p);
  equal(div.children.length, 0, "element has no children after div.remove(p)");
});

test( "replace/1", function() {
  var div= create("div");
  var p = create("p");
  var b = create("blockquote");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
  p.replace(b);
  equal(div.children.length, 1, "element still has one child after p.replace(b)");
  equal(div.children[0], b, "element is indeed the intended <blockquote>");
});

test( "replace/2", function() {
  var div= create("div");
  var p = create("p");
  var b = create("blockquote");
  div.add(p);
  equal(div.children.length, 1, "element has one child after inserting <p>");
  equal(div.children[0], p, "element is indeed the intended <p>");
  div.replace(p, b);
  equal(div.children.length, 1, "element still has one child after div.replace(p,b)");
  equal(div.children[0], b, "element is indeed the intended <blockquote>");
});

test( "clear", function() {
  var div= create("div","<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>");
  equal(div.children.length, 5, "element has five children");
  div.clear();
  equal(div.children.length, 0, "element has no children after clear()");
});

test( "parent", function() {
  var div= create("div");
  var p = create("p");
  div.add(p);
  var parent = p.parent();
  equal(parent, div, "div.p.parent is indeed div");
  parent = parent.parent();
  equal(parent, null, "div.parent() is null");
});

test( "forEach on HTMLelements", function() {
  var p = create("p");
  var f = p.forEach(function(e) { e.innerHTML = "lol"; });
  equal(f, p, "forEach chains correctly");
  equal(p.innerHTML, "lol", "forEach applies function correctly");
});

test( "css/1 - get property value", function() {
  var p = create("p");
  var c = p.css("display");
  ok(!exists(c) || c === "" || c === "block", "correct display value (null, prior to DOM insertion)");
  body.add(p);
  equal(p.css("display"), "block", "correct display value (block, after DOM insertion)");
  p.remove();
});

test( "css/1 - set multiple css property/value pairs", function() {
  var p = create("p");
  equal(p.css({"backgroundColor":"red", "left":"30px", "position":"relative", "zIndex":"999"}), p, "css/2 chains correctly");
  equal(p.css("backgroundColor"), "red", "css/2 applied style (background-color) correctly)");
  equal(p.css("left"), "30px", "css/2 applied style (left) correctly)");
  equal(p.css("position"), "relative", "css/2 applied style (position) correctly)");
  equal(p.css("zIndex"), "999", "css/2 applied style (z-index) correctly)");
});

test( "css/2 - set single css property/value pair", function() {
  var p = create("p");
  equal(p.css("backgroundColor", "red"), p, "css/2 chains correctly");
  equal(p.css("backgroundColor"), "red", "css/2 applied style correctly)");
});

test( "position", function() {
  var parent = create("div", {"style":"margin:0; padding 0; position:fixed; top:0px; left:0px; right: 0px; bottom:0px; background-color: green"});
  var p = create("div", {"style":"margin: 0; padding: 0; position:fixed; top: 10px; left: 20px; bottom: 30px; right: 40px; background-color: red"});
  body.add(parent);
  parent.add(p);
  var pos = p.position();
  var pos2 = p.parent().position();
  equal(pos.top, 10, "top offset is 10");
  equal(pos.left, 20, "left offset is 20");
  equal(pos.bottom + 30, pos2.bottom, "bottom offset is 30");
  equal(pos.right + 40, pos2.right, "right offset is 40");
  p.remove();
  parent.remove();
});

test( "classes().add", function() {
  var p = create("p");
  p.classes().add("monkey");
  p.classes().add("giraffe");
  ok(p.getAttribute("class").indexOf("monkey")!==-1, "p has class 'monkey'");
  ok(p.getAttribute("class").indexOf("giraffe")!==-1, "p has class 'giraffe'");
  ok(p.getAttribute("class").indexOf("blackbird")===-1, "p does not have class 'blackbird'");
});

test( "classes().remove", function() {
  var p = create("p");
  p.classes().add("monkey");
  p.classes().add("giraffe");
  p.classes().remove("monkey");
  ok(p.getAttribute("class").indexOf("monkey")===-1, "p does not have class 'monkey'");
  ok(p.getAttribute("class").indexOf("giraffe")!==-1, "p has class 'giraffe'");
});

test( "classes().contains", function() {
  var p = create("p");
  p.classes().add("monkey");
  p.classes().add("giraffe");
  ok(p.classes().contains("monkey"), "p has class 'monkey'");
  ok(p.classes().contains("giraffe"), "p has class 'giraffe'");
  ok(!p.classes().contains("blackbird"), "p does not have class 'blackbird'");
});

test( "attribute set", function() {
  var p = create("p");
  p.set("autoplay","true");
  p.set("style", "margin:0");
  ok(exists(p.getAttribute("autoplay")) && p.getAttribute("autoplay"), "autoplay was set correctly");
  equal(p.css("margin"), "0px", "style was set correctly");
});

test( "attribute get", function() {
  var p = create("p");
  p.set("style", "margin: 0px;");
  var g = p.get("style");
  equal(g, "margin: 0px;", "attribute get found correct string");
});

test( "child get", function() {
  var div = create("div");
  var p = create("p");
  div.add(p);
  var p2 = div.get(0);
  equal(p, p2, "get child by id succeeded");
});

test( "show", function() {
  var p = create("p","this is some text");
  body.add(p);
  p.show(true);
  ok(!exists(p.get(hiderule)), "element is not tiny-toolkit hidden");
  p.show(false);
  ok(exists(p.get(hiderule)), "element is tiny-toolkit hidden after show(false)")
  p.remove();
});

test( "toggle", function() {
  var p = create("p","this is some text");
  body.add(p);
  p.show(true);
  p.toggle();
  ok(exists(p.get(hiderule)), "element is tiny-toolkit hidden after toggle()")
  p.toggle();
  ok(!exists(p.get(hiderule)), "element is tiny-toolkit hidden after toggle() number two")
  p.remove();
});

test( "html/0", function() {
  var p = create("p","this is some text");
  body.add(p);
  var html = p.html();
  equal(html, "this is some text", "correct html found");
  p.remove();
});

test( "html/1", function() {
  var p = create("p");
  p.html("this is some text");
  body.add(p);
  var html = p.html();
  equal(html, "this is some text", "correct html found");
  p.remove();
});

/**
 * event listening on document and element
 */

test( "listen + ignore (document)", function() {
  var d = document;
  var fired = 0;
  var fn = function() { fired++; };
  d.listen("click", fn);
  ok(exists(d.eventListeners), "document has known eventlisteners");
  ok(exists(d.eventListeners.events), "document has a known events list");
  ok(d.eventListeners.events.indexOf("click") !== -1, "document has a click event listener");
  equal(d.eventListeners.listeners["click"][0], fn, "document has the correct click event handler");

  simulatedClick(d);
  equal(fired, 1, "click handler fired correctly");
  simulatedClick(d);
  equal(fired, 2, "click handler fired correctly on second try");
  d.ignore("click", fn);
  simulatedClick(d);
  equal(fired, 2, "click handler correctly did not fire on third try");

  d.listen("click", function(){});
  d.listen("click", function(){});
  d.listen("click", function(){});
  d.listen("click", function(){});
  d.listen("click", function(){});
  equal(d.eventListeners.listeners["click"].length, 5, "document has 5 click handlers");

  d.ignore("click");
  equal(d.eventListeners.listeners["click"].length, 0, "document has no click handlers");
});

test( "listen + ignore (element)", function() {
  var p = create("p");
  var fired = 0;
  var fn = function() { fired++; };
  p.listen("click", fn);
  body.add(p);
  ok(exists(p.eventListeners), "p has known eventlisteners");
  ok(exists(p.eventListeners.events), "p has a known events list");
  equal(p.eventListeners.events.indexOf("click"), 0, "p has a click event listener");
  equal(p.eventListeners.listeners["click"][0], fn, "p has the correct click event handler");

  simulatedClick(p);
  equal(fired, 1, "click handler fired correctly");
  simulatedClick(p);
  equal(fired, 2, "click handler fired correctly on second try");
  p.ignore("click", fn);
  simulatedClick(p);
  equal(fired, 2, "click handler correctly did not fire on third try");

  p.listen("click", function(){});
  p.listen("click", function(){});
  p.listen("click", function(){});
  p.listen("click", function(){});
  p.listen("click", function(){});
  equal(p.eventListeners.listeners["click"].length, 5, "p has 5 click handlers");

  p.ignore("click");
  equal(p.eventListeners.listeners["click"].length, 0, "p has no click handlers");
});

test( "listenOnce", function() {
  var p = create("p");
  var fired = 0;
  var fn = function() { fired++; };
  p.listenOnce("click", fn);
  body.add(p);
  ok(exists(p.eventListeners), "p has known eventlisteners");
  equal(p.eventListeners.events.indexOf("click"), 0, "p has a click event listener");
  simulatedClick(p);
  equal(fired, 1, "click handler fired correctly");
  equal(p.eventListeners.listeners["click"].length, 0, "p has no click event handler after firing once");
  simulatedClick(p);
  equal(fired, 1, "click handler correctly didn't fire on second try");
  p.remove();
});




/**
 * Array[HTMLElement] tests
 */
test( "add", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.add(create("p"));
  equal(result[0].children.length, 1, "added element to first result set element");
  for(var i=1; i<6; i++) {
    equal(result[i].children.length, 0, "did not add element to subsequent result set element");
  }
});

test( "remove/0", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.remove();
  equal(div.children.length, 0, "removed all elements");
});

test( "remove/1 - by id (0)", function() {
  var div= create("div");
  div.add(create("p","<i>1</i>"),create("p","<i>2</i>"),create("p","<i>3</i>"),create("p","<i>4</i>"),create("p","<i>1</i>"),create("p","<i>6</i>"));
  var result = div.find("p");
  result.remove(0);
  equal(div.children.length, 6, "preserved original children");
  for(var i=0; i<6; i++) {
    equal(result[i].children.length, 0, "removed all sub-elements");
  }
});

test( "remove/1 - by id (0)", function() {
  var div= create("div");
  div.add(create("p","<i>1</i>"),create("p","<i>2</i>"),create("p","<i>3</i>"),create("p","<i>4</i>"),create("p","<i>1</i>"),create("p","<i>6</i>"));
  var result = div.find("p");
  result.remove(div.children[2].children[0]);
  equal(div.children.length, 6, "preserved original children");
  for(var i=0; i<6; i++) {
    if(i!==2)
      equal(result[i].children.length, 1, "preserved non-matching children");
    else
      equal(result[i].children.length, 0, "removed matching child");
  }
});

test( "replace/1", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var r = create("img");
  var result = div.find("p");
  result = result.replace(r);
  equal(result, r, "result of replace was a single element");
  equal(div.children.length, 6, "div still has six elements");
  equal(div.get(0), r, "first child of div is replacement");
  result = div.find("p");
  equal(result.length, 5, "there are now only five <p> elements");
});

test( "replace/2", function() {
  var div= create("div");
  div.add(create("p","<i>1</i>"),create("p","<i>2</i>"),create("p","<i>3</i>"),create("p","<i>4</i>"),create("p","<i>1</i>"),create("p","<i>6</i>"));
  var s = div.children[2].children[0];
  var r = create("img");
  var result = div.find("p");
  result = result.replace(s, r);
  equal(result, r, "result of replace was a single element");
  equal(div.children.length, 6, "div still has six elements");
  ok(div.get(0) !== r, "first child of div is not the replacement");
  equal(div.get(2).get(0), r, "first child of second <p> is the replacement");
});

test( "clear", function() {
  var div= create("div");
  div.add(create("p","<i>1</i>"),create("p","<i>2</i>"),create("p","<i>3</i>"),create("p","<i>4</i>"),create("p","<i>1</i>"),create("p","<i>6</i>"));
  var result = div.find("p");
  result.clear();
  equal(div.children.length, 6, "div still has six elements");
  for(var i=0; i<6; i++) {
    equal(result[i].children.length, 0, "element "+i+"was cleared");
  }
});

test( "forEach", function() {
  var div= create("div");
  div.add(create("p","1"),create("p","2"),create("p","3"),create("p","4"),create("p","5"),create("p","6"));
  var result = div.find("p");
  var content = "";
  result.forEach(function(e){
    content += e.html();
  });
  equal(content, "123456", "forEach did what it's supposed to");
});

test( "css/2 verified via style", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.css("backgroundColor","red");
  for(var i=0; i<6; i++) {
    equal(div.get(i).style.backgroundColor, "red", "element "+i+" was styled correctly");
  }
});

test( "css/2 verified via css/1", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.css("backgroundColor","red");
  for(var i=0; i<6; i++) {
    equal(div.get(i).css("backgroundColor"), "red", "element "+i+" was styled correctly");
  }
});

test( "css/1 (css multi-pair object) verified via css/1", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  body.add(div);
  var result = div.find("p");
  result.css({"backgroundColor":"red", "color":"green", "border":"1px solid blue"});
  var col;
  for(var i=0; i<6; i++) {
    equal(div.get(i).css("backgroundColor"), "red", "element "+i+" was styled correctly");
    col = div.get(i).css("color");
    ok(col === "green" || col === "rgb(0, 128, 0)", "element "+i+" was styled correctly");
    equal(div.get(i).css("borderColor"), "blue", "element "+i+" was styled correctly");
  }
  div.remove();
});

test( "position", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  body.add(div);
  var result = div.find("p");
  result = result.position();
  for(var i=0; i<6; i++) {
    ok(result[i] instanceof ClientRect, "position object found");
  }
  div.remove();
});

test( "classes.add", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.classes().add("monkey");
  result.classes().add("giraffe");
  for(var i=0; i<6; i++) {
    ok(div.get(i).classes().contains("monkey"), "element has class 'monkey'");
    ok(div.get(i).classes().contains("giraffe"), "element has class 'monkey'");
  }
});

test( "classes.remove", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.classes().add("monkey");
  result.classes().add("giraffe");
  result.classes().remove("monkey");
  for(var i=0; i<6; i++) {
    ok(!div.get(i).classes().contains("monkey"), "element does not have class 'monkey'");
    ok(div.get(i).classes().contains("giraffe"), "element has class 'monkey'");
  }
});

test( "classes.contains", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.classes().add("monkey");
  div.get(2).classes().add("giraffe");
  ok(result.classes().contains("monkey"), "one or more elements have class 'monkey'");
  ok(result.classes().contains("giraffe"), "one or more elements have class 'giraffe'");
  ok(!result.classes().contains("blackbird"), "no elements have class 'blackbird'");
});

test( "attribute set", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.set("autoplay","true");
  result.set("style", "margin: 0px;");
  result = div.find("*[autoplay=true]");
  equal(result.length, 6, "found all elements");
  result = div.find("*[style='margin: 0px;']");
  equal(result.length, 6, "found all elements");
});

test( "attribute set", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.set("autoplay","true");
  result.set("style", "margin: 0px;");
  result = div.find("*[autoplay=true]");
  equal(result.length, 6, "found all elements");
  result = div.find("*[style='margin: 0px;']");
  equal(result.length, 6, "found all elements");
});

test( "attribute get", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  var result = div.find("p");
  result.set("data-lol","cat");
  result = result.get("data-lol");
  for(var i=0; i<6; i++) {
    equal(result[i], "cat", "attribute was found, with correct name");
  }
});


test( "child get", function() {
  var div= create("div");
  div.add(create("p","<i>1</i>"),create("p"),create("p","<i>2</i>"),create("p"),create("p","<i>3</i>"),create("p"));
  var result = div.find("p");
  result = result.get(0);
  for(var i=0; i<6; i++) {
    if(i%2===0)
      equal(result[i], div.get(i).get(0), "child found");
    else
      equal(result[i], undefined, "there is no child");
  }
});

test( "show", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  body.add(div);
  var result = div.find("p");
  result.show(false);
  for(var i=0; i<6; i++) {
    ok(exists(result[i].get(hiderule)), "element was hidden");
  }
  result.show(true);
  for(var i=0; i<6; i++) {
    ok(!exists(result[i].get(hiderule)), "element was not hidden");
  }
});

test( "toggle", function() {
  var div= create("div");
  div.add(create("p"),create("p"),create("p"),create("p"),create("p"),create("p"));
  body.add(div);
  var result = div.find("p");
  result.show(true).toggle();
  for(var i=0; i<6; i++) {
    ok(exists(result[i].get(hiderule)), "element was hidden");
  }
  result.toggle();
  for(var i=0; i<6; i++) {
    ok(!exists(result[i].get(hiderule)), "element was not hidden");
  }
})

test( "html/0", function() {
  var div= create("div");
  div.add(create("p","1"),create("p","2"),create("p","3"),create("p","4"),create("p","5"),create("p","6"));
  var result = div.find("p");
  var content = result.html();
  for(var i=0; i<6; i++) {
    equal(content[i], ""+(i+1), "element had correct HTML content");
  }
});

test( "html/1", function() {
  var div= create("div");
  div.add(create("p","1"),create("p","2"),create("p","3"),create("p","4"),create("p","5"),create("p","6"));
  var result = div.find("p");
  result = result.html("you got it").html();
  for(var i=0; i<6; i++) {
    equal(result[i], "you got it", "element had correct HTML content");
  }
});

test( "listen", function() {
  var div= create("div");
  div.add(create("p","1"),create("p","2"),create("p","3"),create("p","4"),create("p","5"),create("p","6"));
  body.add(div);
  var result = div.find("p");
  var clicks = 0;
  result.listen("click", function() { clicks++; });
  for(var i=0; i<6; i++) {
    simulatedClick(div.get(i));
  }
  equal(clicks, 6, "all events fired");
  for(var i=0; i<6; i++) {
    simulatedClick(div.get(i));
  }
  equal(clicks, 12, "all events fired again");
  div.remove();
});

test( "listenOnce", function() {
  var div= create("div");
  div.add(create("p","1"),create("p","2"),create("p","3"),create("p","4"),create("p","5"),create("p","6"));
  body.add(div);
  var result = div.find("p");
  var clicks = 0;
  result.listenOnce("click", function() { clicks++; });
  for(var i=0; i<6; i++) {
    simulatedClick(div.get(i));
  }
  equal(clicks, 6, "all events fired");
  for(var i=0; i<6; i++) {
    simulatedClick(div.get(i));
  }
  equal(clicks, 6, "no events fired again");
  div.remove();
});

/**
 * Ajax tests
 */
test( "get (synchronous)", function() {
  var data = get("test.html");
  ok(exists(data), "there was data");
  ok(data.indexOf("<title>Tiny Toolkit unit tests</title>") !== -1, "title information was found");
});

asyncTest( "get (asynchronous callback)", 2, function() {
  get("test.html", function(xhr) {
    var data = xhr.responseText;
    ok(exists(data), "there was data");
    ok(data.indexOf("<title>Tiny Toolkit unit tests</title>") !== -1, "title information was found");
    start();
  });
});

/**
 * Array specials
 */
test( "pushUnique", function() {
  var m = [];
  m.pushUnique("1");
  m.pushUnique("2");
  m.pushUnique("3");
  m.pushUnique("2");
  m.pushUnique("1");
  ok(m.length === 3, "correct array lengh");
});

test( "array .test", function() {
  equal([1,2,3].test(function(v){ return v%2==0; }), true, "some elements in [1,2,3] conform to v%2==0");
  equal([1,2,3].test(function(v){ return v%2==0; }, true), false, "not all elements in [1,2,3] conform to v%2==0");
});

/**
 * Templating
 */
test( "templates", function() {
  var now = function() { var d = new Date(); return d.getTime() + d.getMilliseconds()/1000; }
  var start = now();
  var d = template("test", {title: "template title", showvalue: "show"});
  var interval = now() - start;
  ok(d instanceof HTMLElement, "template imported as html element");
  equal(d.nodeName, "SECTION", "template has correect outer tag");
  equal(d.children.length, 3, "template has three children.");
  equal(d.children[0].innerHTML, "template title", "correct title");
  equal(d.children[2].innerHTML, "This should show up. And the above title is \"template title\".", "correct paragraph text");
});

/**
 * Input type=range
 */
test( "input type=range", function() {
  var d = create("input", {"id":"inputrange", "min": 10, "max": 25, "step": 1});
  body.add(d);
  d.set("type","range");
  d = find("#inputrange");
  equal(d.nodeName, "DIV", "transformed to a div");
  equal(d.id, "inputrange", "correct id");
  equal(d.children.length, 1, "transformed to a 1-child div");

  var evt = { "clientX": (body.clientWidth/2)|0, button: 1, which: 1 };
  d.eventListeners.listeners["mousedown"].forEach(function(f){ f(evt); });
  document.eventListeners.listeners["mouseup"].forEach(function(f){ f(evt); });
  var value = d.get("value");
  equal(value, 17, "slider was repositioned correctly");
//  body.remove(d);
});
