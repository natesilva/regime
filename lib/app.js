var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var Seq = require('seq');
var getPort = require('./getPort.js');
var onCrashed = require('./customActions.js').events.onCrashed;
var log = require('./log.js');

function App(appDir) {
  this.appDir = appDir;
  this.pid = null;
  this.port = null;
  this.name = path.basename(appDir);
}

module.exports = App;

App.START_SCRIPTS = ['app.js', 'server.js'];

App.prototype.toJSON = function() {
  return {
    name: this.name,
    started: (this.pid ? true : false),
    pid: this.pid || null,
    port: this.pid && this.port || null
  };
};

App.prototype.stop = function() {
  this.lastState('stopping');
  if (this.pid) { process.kill(this.pid); }
  this.pid = null;
  this.lastState('stopped');
};

App.prototype.lastState = function(newState) {
  var stateFile = path.join(this.appDir, 'lastState');
  if (newState) {
    fs.writeFileSync(stateFile, newState + '\n');
  } else if (fs.existsSync(stateFile)) {
    var data = fs.readFileSync(stateFile);
    return data.toString().trim();
  }
};

App.prototype.getStartScript = function() {
  var cloneDir = path.join(this.appDir, 'clone');
  return App.START_SCRIPTS.reduce(function(prev, curr) {
    if (prev) { return prev; }
    return fs.existsSync(path.join(cloneDir, curr)) ? curr : prev;
  }, null);
};

App.prototype.deploy = function(callback) {
  var self = this;

  if (!fs.existsSync(path.join(this.appDir, 'clone', 'package.json'))) {
    return process.nextTick(callback);
  }

  var options = {
    cwd: path.join(this.appDir, 'clone'),
    env: process.env
  };

  var child = spawn('npm', ['install', '--production'], options);
  child.on('exit', function(code) {
    if (code) {
      return callback(new Error('npm install failed for ' + self.name +
        ' with code ' + code));
    }
    callback();
  });
};

App.prototype.start = function(callback) {
  var startScript = this.getStartScript();
  if (!startScript) {
    return process.nextTick(
      callback.bind(null, new Error('no startup script for ' + this.name))
    );
  }

  var logsDir = path.join(this.appDir, 'logs');
  if (!fs.existsSync(logsDir)) { fs.mkdir(logsDir); }

  var self = this;
  Seq()
    .par('port', getPort, Seq)
    .par('stdout', fs.open, path.join(logsDir, 'stdout.txt'), 'a', Seq)
    .par('stderr', fs.open, path.join(logsDir, 'stderr.txt'), 'a', Seq)
    .seq(function() {
      var env = {};
      Object.keys(process.env).forEach(function(key) {
        env[key] = process.env[key];
      });
      env.NODE_ENV = 'production';
      env.PORT = this.vars.port;

      var options = {
        cwd: path.join(self.appDir, 'clone'),
        stdio: ['ignore', this.vars.stdout, this.vars.stderr],
        env: env
      };

      self.stop();
      var child = spawn('node', [startScript], options);
      self.pid = child.pid;
      self.port = this.vars.port;

      child.on('exit', function(code) {
        fs.close(options.stdio[1]);
        fs.close(options.stdio[2]);
        if (this.pid === self.pid) { self.pid = null; }
        var lastState = self.lastState();
        if (lastState !== 'stopped' && lastState !== 'stopping') {
          onCrashed(self.name);
        }
        log.warn('[' + self.name + '] pid', this.pid, 'exited with code', code);
      });

      self.lastState('started');
      log.info('[' + self.name + '] started with pid', self.pid, 'on port',
        self.port);
      callback();
    })
    ['catch'](callback)
  ;

};

module.exports = App;
