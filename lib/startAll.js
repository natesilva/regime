var fs = require('fs');
var path = require('path');
var Seq = require('seq');
var App = require('./app.js');
var loadedApps = require('./loadedApps.js');
var onConfigChanged = require('./customActions').onConfigChanged;

module.exports = function(reposDir) {
  if (!fs.existsSync(reposDir)) { return; }

  var dirs = fs.readdirSync(reposDir);
  dirs = dirs.filter(function(dir) {
    return fs.statSync(path.join(reposDir, dir)).isDirectory();
  });
  dirs = dirs.filter(function(dir) { return dir !== '_regime'; });

  Seq(dirs)
    .parEach(function(appDir) {
      var app = new App(path.join(reposDir, appDir));
      loadedApps[app.name] = app;
      if (app.lastState() === 'started') { app.start(this); }
    })
    .seq(function() { onConfigChanged(dirs); })
  ;
};
