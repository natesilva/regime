var net = require('net');
var MIN_PORT = 49152;
var MAX_PORT = 65535;

function getPort(callback) {
  var port = Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;

  var server = net.createServer();

  server.on('error', function() { getPort(callback); });

  server.listen(port, function() {
    server.once('close', function() { callback(null, port); });
    server.close();
  });
}

module.exports = getPort;
