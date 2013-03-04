var path = require('path');
var exec = require('child_process').exec;

function loadModule(reposDir, name) {
  var modulePath = path.join(reposDir, '_regime', 'clone', name);
  delete require.cache[modulePath];

  try {
    var module = require(modulePath);
    console.log('[custom actions] loaded', name);
    return module;
  } catch(e) {
    return null;
  }
}

function runMiddleware(mw, req, res, next) {
  if (!mw) { return next(req, res); }

  mw(req, res, function(err) {
    if (err) {
      console.error(err);
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
      var cmd = actions._events.configChanged + ' ' + appsChanged.join(' ');
      console.log('[custom actions] exec-ing', actions._events.configChanged);
      exec(cmd, actions._execOptions);
    },

    onCrashed: function(appName) {
      if (!actions._events || !actions._events.appCrashed) { return; }
      var cmd = actions._events.appCrashed + ' ' + appName;
      console.log('[custom actions] exec-ing', actions._events.appCrashed);
      exec(cmd, actions._execOptions);
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
