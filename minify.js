console.log("Compile started...");

var fs = require("fs"),
    compressor = require("node-minify"),
    aggregateData = "",
    files = [
      "tiny-toolkit",
      "extensions/input type range/tiny-toolkit-input-type-range",
      "extensions/templating/tiny-toolkit-templating"
    ];

files.forEach(function minify(file) {
  console.log("Minifying "+file);
  new compressor.minify({
    type: 'gcc',
    fileIn: file + '.js',
    fileOut: file + '-min.js'
  });
});
