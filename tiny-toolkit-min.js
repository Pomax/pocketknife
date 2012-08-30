(function(a,b,c){if(a["Toolkit"])return;var d={update:function(a){return a},addUpdate:function(a){var b=this.update;this.update=function(c){return a(b(c))}}};a["Toolkit"]=d;a["create"]=function(a,c,e){var f=k(b.createElement(a));if(c){for(p in c){if(Object.hasOwnProperty(c,p))continue;f.setAttribute(p,c[p])}}if(e){f.innerHTML=e}return d.update(f)};var e=function(a){var b=new XMLHttpRequest;b.open("GET",a,false);b.send(null);return b.responseText.replace(/>[\s\r\n]+</g,"><")};var f=function(a){return function(b){return b!==a&&b!==null}}();var g={};var h=function(a,b){if(!g[a]){g[a]=e(a+".tpl.html")}var c=g[a],d,h=[],i,j=0,k,l=new RegExp("{{#([^}]+)}}((\n|.)*?){{\\/\\1}}","g"),m;while(m=l.exec(c)){h.push(m[1]);j++}for(i=0;i<j;i++){k=h[i];l=new RegExp("{{#"+k+"}}((\n|.)*?){{\\/"+k+"}}","g");if(f(b[k])){c=c.replace(l,"$1")}else{c=c.replace(l,"")}}for(k in b){if(Object.hasOwnProperty(b,k))continue;d=b[k];c=c.replace(new RegExp("{{"+k+"}}","g"),d)}return c};var i=function(a){var b=a.getAttribute("class");var c=!b?[]:b.split(/\s+/);var d=function(){a.setAttribute("class",c.join(" "))};this.add=function(b){if(c.indexOf(b)===-1){c.push(b)}d();return a};this.remove=function(b){var e=c.indexOf(b);if(e>-1){c.splice(e,1);d()}return a};this.contains=function(a){return c.indexOf(a)!==-1}};var j=function(a,b,c){if(!f(a[b])){a[b]=c}};var k=function(a){if(!f(a))return;if(f(a["__ttk_extended"]))return a;j(a,"find",function(b){return q(a,b)});j(a,"template",function(b,c){return d.update(a.html(h(b,c)))});j(a,"css",function(c,d){if(d&&d!==""){a.style[c]=d;return a}if(d===""){var e=a.get("style");if(e){e=e.replace(new RegExp(c+"\\s*:\\s*"+d,""),"");a.set("style",e)}return a}if(!d&&typeof c==="object"){for(p in c){if(Object.hasOwnProperty(c,p))continue;a.css(p,c[p])}return a}return b.defaultView.getComputedStyle(a,null).getPropertyValue(c)||a.style[c]});j(a,"position",function(){return a.getBoundingClientRect()});j(a,"classes",function(){if(!a.__ttk_clobj){a.__ttk_clobj=new i(a)}return a.__ttk_clobj});j(a,"show",function(b){if(b){a.set("data-tiny-toolkit-hidden","")}else{a.removeAttribute("data-tiny-toolkit-hidden")}return a});j(a,"toggle",function(){a.show(!f(a.get("data-tiny-toolkit-hidden")));return a});j(a,"html",function(b){if(f(b)){a.innerHTML=b;return a}return a.innerHTML});j(a,"parent",function(){return k(a.parentNode)});j(a,"add",function(){for(var b=0,c=arguments.length;b<c;b++){if(f(arguments[b])){a.appendChild(arguments[b])}}return a});j(a,"replace",function(a,b){if(f(a.parentNode)){a.parentNode.replaceChild(b,a)}return b});j(a,"remove",function(b){if(!b){a.parentNode.removeChild(a);return}if(parseInt(b)==b){a.removeChild(a.children[b])}else{a.removeChild(b)}return a});j(a,"clear",function(){while(a.children.length>0){a.remove(a.get(0))}return a});j(a,"get",function(b){if(b==parseInt(b)){return k(a.children[b])}return a.getAttribute(b)});j(a,"set",function(b,c){if(!f(c)){for(prop in b){if(!Object.hasOwnProperty(b,prop)){a.setAttribute(prop,b[prop])}}}else{a.setAttribute(b,c)}return a});j(a,"listenOnce",function(b,c,d){var e=function(){a.removeEventListener(b,e,d|false);c.call(arguments)};a.addEventListener(b,e,d|false);return a});j(a,"listen",function(b,c,d){a.addEventListener(b,c,d|false);return a});j(a,"do",function(b){b(a);return a});a["__ttk_extended"]=true;return a};a["extend"]=k;var l=function(a,b,c,d){for(var e=0,g=a.length;e<g;e++){k(f(b)?a[e][b]():a[e])[c].apply(a[e],d)}return a};var m=[],n=function(){return m};m["classes"]={add:n,remove:n};m["remove"]=n;m["do"]=n;var o=function(a){var b=["css","show","toggle","set","listen","listenOnce"],c=b.length,d,e;for(d=0;d<c;d++){e=b[d];a[e]=function(b){return function(){return l(a,null,b,arguments)}}(e);m[e]=n}var f={add:function(){return l(a,"classes","add",arguments)},remove:function(){return l(a,"classes","remove",arguments)}};a["classes"]=function(){return f};a["remove"]=function(){l(a,"remove",arguments);return m};a["do"]=function(b){for(var c=0,d=a.length;c<d;c++){b(a[c])}return a};return a};var q=function(a,b){var c=a.querySelectorAll(b),d=[];if(c.length==0)return m;if(c.length==1){return k(c[0])}for(var e=0,f=c.length;e<f;e++){d[e]=k(c[e])}return o(d)};(function(){var a=create("style",{type:"text/css"},"*[data-tiny-toolkit-hidden]{display:none!important;visibility:hidden!important;opacity:0!important;}");b.head.appendChild(a)})();k(b).listenOnce("DOMContentLoaded",function(){k(c)});a["find"]=function(a){return q(b,a)};a["template"]=function(a,b){return d.update(k(create("div").template(a,b).children[0]))}}(window,document,document.body));
