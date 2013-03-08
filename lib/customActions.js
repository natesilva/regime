var path = require('path');
var exec = require('child_process').exec;
var Seq = require('seq');
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

var CA = {
  reload: function(reposDir) {
    CA._actions = loadModule(reposDir, 'actions.json') || {};

    CA._execOptions = {
        cwd: path.join(reposDir, '_regime', 'clone'),
        env: process.env
    };
  },

  _run: function(actions, args, callback) {
    callback = callback || function() {};
    if (!actions) { return callback(); }
    if (!Array.isArray(actions)) { actions = [actions]; }

    Seq(actions)
      .parEach(function(action) {
        var cmd = action + ' ' + args.join(' ');
        log.info('[custom actions] exec-ing', cmd);
        exec(cmd, CA._execOptions, CA);
      })
      .seq(function() { callback(); })
      ['catch'](callback)
    ;
  },

  _basicAuth: function(req, res, actions, next) {
    var header = req.headers.authorization || '';       // get the header
    var token = header.split(/\s+/).pop() || '';        // encoded auth token
    var auth = new Buffer(token, 'base64').toString();  // convert from base64
    var parts = auth.split(':');                        // split on colon
    var username = parts[0];
    var password = parts[1];

    CA._run(actions, username, password, function(err) {
        if (err) {
          res.statusCode = 401;
          res.setHeader('WWW-Authenticate', 'Basic realm="regime"');
          res.end('401 Unauthorized');
        } else {
          next();
        }
    });
  },

  onConfigChanged: function(appsChanged) {
    CA._run(CA._actions.configChanged, appsChanged);
  },

  onCrashed: function(appName) {
    CA._run(CA._actions.appCrashed, appName);
  },

  gitAuth: function(req, res, next) {
    CA._basicAuth(req, res, CA._actions.gitAuth, next);
  },

  apiAuth: function(req, res, next) {
    CA._basicAuth(req, res, CA._actions.apiAuth, next);
  }
};

module.exports = CA;
