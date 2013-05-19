module.exports = function( grunt ) {

  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    jshint: {
      files: [
        "Gruntfile.js",
        "minify.js",
        "pocketknife.js",
        "extensions/**/*.js"
      ]
    }
  });
  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.registerTask( "default", [ "jshint" ]);
};
