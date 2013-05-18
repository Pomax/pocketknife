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
  var filename = file.substring(file.lastIndexOf('/')+1);
  console.log("Minifying "+file);
  new compressor.minify({
    type: 'gcc',
    fileIn: file + '.js',
    fileOut: "release/" + filename+ '-min.js'
  });
});
