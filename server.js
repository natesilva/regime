var http = require('http');
var url = require('url');
var path = require('path');
var pushover = require('pushover');
var log = require('./lib/log.js');

var reposDir =
  process.env.REPOS || process.argv[2] || path.join(__dirname, 'repos');

var repos = pushover(function(repo) {
  return path.join(reposDir, repo, 'repo');
});

repos.on('push', require('./lib/onPush.js')(reposDir));
repos.on('fetch', require('./lib/onFetch.js'));

var customActions = require('./lib/customActions.js');
customActions.reload(reposDir);

require('./lib/startAll.js')(reposDir);

var server = http.createServer();
server.on('error', function(err) { log.error(err); });

server.on('request', function(req, res) {
  var parts = url.parse(req.url);
  if (parts.pathname === '/status') {
    customActions.middleware.admin(req, res, require('./lib/onStatus.js'));
  }
  else if (parts.pathname.match(/^\/start\//)) {
    customActions.middleware.admin(req, res, require('./lib/onStart.js'));
  }
  else if (parts.pathname.match(/^\/stop\//)) {
    customActions.middleware.admin(req, res, require('./lib/onStop.js'));
  }
  else {
    customActions.middleware.repos(req, res, repos.handle.bind(repos));
  }
});

server.listen(process.env.PORT || 2677, function() {
  var address = server.address();
  log.info('>>> regime is listening on', address.family, 'port',
    address.port);
});
