var path = require('path');
var Seq = require('seq');
var cloneRepo = require('./cloneRepo.js');

var App = require('./app.js');
var loadedApps = require('./loadedApps.js');
var customActions = require('./customActions');

module.exports = function(reposDir) {

  var onPush = function(push) {
    var log = function(message) {
      console.log('[' + push.repo + '/' + push.branch + '] ' + message);
    };

    log('accepting push at commit ' + push.commit);
    push.accept();

    push.on('exit', function() {
      log('push completed');
      var src = path.join(reposDir, push.repo, 'repo');
      var dest = path.join(reposDir, push.repo, 'clone');

      Seq()
        .seq(function() { cloneRepo(src, dest, push.branch, this); })
        .seq(function() {
          if (!(push.repo in loadedApps)) {
            var app = new App(path.join(reposDir, push.repo));
            loadedApps[push.repo] = app;
          }
          log('installing dependencies');
          loadedApps[push.repo].deploy(this);
        })
        .seq(function() {
          if (push.repo === '_regime') {
            delete loadedApps._regime;
            log('re-loading custom actions');
            customActions.reload(reposDir);
          } else {
            log('starting');
            loadedApps[push.repo].start(this);
            customActions.events.onConfigChanged([push.repo]);
          }
        })
        ['catch'](function(err) { console.error(err); })
      ;
    });
  };

  return onPush;
};
