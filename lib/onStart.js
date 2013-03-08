var loadedApps = require('./loadedApps');
var onConfigChanged = require('./customActions').onConfigChanged;

var rx = /^\/start\/(.+)/;

module.exports = function(req, res) {
  var matches = req.url.match(rx);
  if (!matches || !(matches[1] in loadedApps)) {
    res.statusCode = 404;
    return res.end('404 Not Found');
  }

  var app = loadedApps[matches[1]];

  app.start(function(err) {
    onConfigChanged([app.name]);
    if (err) {
      res.statusCode = 500;
      return res.end(err);
    }
    res.end('started ' + matches[1] + ' on port ' + app.port);
  });
};
