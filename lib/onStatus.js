var loadedApps = require('./loadedApps.js');

module.exports = function(req, res) {
  var json = JSON.stringify(loadedApps);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Length', Buffer.byteLength(json, 'utf8').toString());
  res.end(json);
};
