/**
  Quasi-handlerbar templating
**/
(function(window) {
  "use strict";

  // is Pocketknife loaded?
  if(!window.Pocketknife) return;

  // list of known templates
  var templates = {};

  // recursion is required to actually find all templating blocks
  var getConditionals = function(string) {
    var RE = new RegExp("{{#([^}]+)}}(([\\w\\W])*?){{\\/\\1}}",'g'),
        props = [],
        match,
        last,
        i;
    // preprocess: conditional blocks
    while (!!(match = RE.exec(string))) {
      props.push(match[1]);
      var found = getConditionals(match[2]);
      for (i = 0, last = found.length; i < last; i++) {
        props.push(found[i]);
      }
    }
    return props;
  };

  /**
   * Insanely simple templating - replace {{moo}} with replacements.moo,
   * then use this template as the content for <element>.
   * Conditionals are supported mustache-style, so {{#name}}when exists{{/name}}
   */
  window.Pocketknife.template = function(templateName, replacements) {
    if (!templates[templateName]) {
      templates[templateName] = get(templateName+".tpl.html");
    }

    var replaced = templates[templateName],
        props = [], i, last = 0, prop, RE;

    props = getConditionals(replaced, props);
    last = props.length;

    for(i=0; i<last; i++) {
      prop = props[i];
      RE = new RegExp("{{#"+prop+"}}(([\\w\\W])*?){{\\/"+prop+"}}",'g');
      // known property: unwrap for substitution
      if (exists(replacements[prop]) && replacements[prop] !== false) {
        replaced = replaced.replace(RE, "$1");
      }
      // unknown property: remove entire block
      else { replaced = replaced.replace(RE, ''); }
    }

    // then perform real substitutions
    for (prop in replacements) {
      if (Object.hasOwnProperty(replacements, prop)) continue;
      // {{prop}} and {{prop | ...} replacement
      replaced = replaced.replace(new RegExp("{{"+prop+"( | [^}]*)?}}",'g'), replacements[prop]);
    }

    // do the fallback substitutions for all unmatched {{prop | ...}}
    replaced = replaced.replace(new RegExp("{{[^|]+\\s*\\|\\s*([^}]*)}}",'g'), "$1");

    return replaced;
  };

  /**
   * turn a template into a DOM fragment
   */
  window.template = function(name, macros) {
    var top = create("div", window.Pocketknife.template(name,macros)),
        children = Array.prototype.slice.apply(top.children);
    return (children.length === 1 ? children[0] : children);
  };

}(window));