console.log("Compile started...");

var fs = require("fs"),
    compressor = require("node-minify"),
    aggregateData = "",
    files = [
      "pocketknife",
      "extensions/range/range",
      "extensions/templating/templates"
    ];

files.forEach(function minify(file) {
  var filename = file.substring(file.lastIndexOf('/')+1);
  console.log("Minifying "+file);
  try { fs.mkdirSync("release"); } catch(e) {}
  new compressor.minify({
    type: 'gcc',
    fileIn: file + '.js',
    fileOut: "release/" + filename+ '-min.js'
  });
});
