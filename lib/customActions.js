var path = require('path');
var exec = require('child_process').exec;
var log = require('./log.js');

function loadModule(reposDir, name) {
  var modulePath = path.join(reposDir, '_regime', 'clone', name);
  delete require.cache[modulePath];

  try {
    var module = require(modulePath);
    log.info('[custom actions] loaded', name);
    return module;
  } catch(e) {
    return null;
  }
}

function runMiddleware(mw, req, res, next) {
  if (!mw) { return next(req, res); }

  mw(req, res, function(err) {
    if (err) {
      log.error(err);
      res.statusCode = 500;
      return res.end('500 Internal Server Error');
    }
    next(req, res);
  });
}

var actions = {
  reload: function(reposDir) {
    this._reposmw = loadModule(reposDir, 'reposMiddleware.js');
    this._adminmw = loadModule(reposDir, 'adminMiddleware.js');
    this._events = loadModule(reposDir, 'events.json');

    this._execOptions = {
        cwd: path.join(reposDir, '_regime', 'clone'),
        env: process.env
    };
  },

  events: {
    onConfigChanged: function(appsChanged) {
      if (!actions._events || !actions._events.configChanged) { return; }
      var cmds = actions._events.configChanged;
      if (!Array.isArray(cmds)) { cmds = [cmds]; }
      cmds.forEach(function(cmd) {
        cmd += ' ' + appsChanged.join(' ');
        log.info('[custom actions] exec-ing', actions._events.configChanged);
        exec(cmd, actions._execOptions);
      });
    },

    onCrashed: function(appName) {
      if (!actions._events || !actions._events.appCrashed) { return; }
      var cmds = actions._events.appCrashed;
      if (!Array.isArray(cmds)) { cmds = [cmds]; }
      cmds.forEach(function(cmd) {
        cmd += ' ' + appName;
        log.info('[custom actions] exec-ing', actions._events.configChanged);
        exec(cmd, actions._execOptions);
      });
    }
  },

  middleware: {
    repos: function(req, res, next) {
      runMiddleware(actions._reposmw, req, res, next);
    },
    admin: function(req, res, next) {
      runMiddleware(actions._adminmw, req, res, next);
    }
  }
};

module.exports = actions;
