var fs = require('fs');
var execFile = require('child_process').execFile;

function pull(dest, branch, callback) {
  var options = { cwd: dest, env: process.env };

  var pullProc = execFile('git', ['pull'], options);
  pullProc.on('exit', function(code) {
    if (code) {
      return callback(new Error('could not pull in ' + dest));
    }

    var checkoutProc = execFile('git', ['checkout', branch], options);
    checkoutProc.on('exit', function(code) {
      if (code) {
        return callback(new Error('could not checkout ' + branch + ' in ' +
          dest));
      }
      callback();
    });
  });
}

function clone(src, dest, branch, callback) {
  var child = execFile('git', ['clone', src, dest]);
  child.on('exit', function(code) {
    if (code) {
      return callback(new Error('could not clone ' + src + ' to ' + dest));
    }
    callback();
  });
}

module.exports = function(src, dest, branch, callback) {
  if (fs.existsSync(dest)) { pull(dest, branch, callback); }
  else { clone(src, dest, branch, callback); }
};
