var loadedApps = require('./loadedApps');
var onConfigChanged = require('./customActions').events.onConfigChanged;

var rx = /^\/stop\/(.+)/;

module.exports = function(req, res) {

  var matches = req.url.match(rx);
  if (!matches || !(matches[1] in loadedApps)) {
    res.statusCode = 404;
    return res.end('404 Not Found');
  }

  loadedApps[matches[1]].stop();
  res.end('stopping ' + matches[1]);
  onConfigChanged(matches[1]);
};
