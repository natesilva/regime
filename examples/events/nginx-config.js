//
// This is only an example. You will almost certainly have to modify
// it for your environment.
//
// Copy this file to your _regime config repo and:
//
// 1. Add "request" as a dependency in package.json.
// 2. Edit YOUR_DOMAIN, NGINX_CONF_FILE and NGINX_RELOAD_COMMAND.
// 3. Add this file to events.json as the configChanged handler:
//    { "configChanged": "node ./nginx-config.js" }
//
// In your nginx configuration, include NGINX_CONF_FILE.
//

var fs = require('fs');
var exec = require('child_process').exec;
var request = require('request');

var YOUR_DOMAIN = 'example.com';
var NGINX_CONF_FILE = '/etc/nginx/conf.d/regime-apps.conf';
var NGINX_RELOAD_COMMAND = 'service nginx reload';

request('http://localhost:2677/status', function(err, res, body) {
  if (err || res.statusCode > 299) { return; }

  var apps = JSON.parse(body);
  var appNames = Object.keys(apps);

  var configs = appNames.map(function(appName) {
    var app = apps[appName];
    var config = [
      'upstream ' + appName + ' {',
      '  server 127.0.0.1:' + app.port + ';',
      '}',
      '',
      'server {',
      '  listen 80;',
      '  server_name ' + appName + '.' + YOUR_DOMAIN + ';',
      '  location / {',
      '    proxy_pass http://' + appName + ';',
      '  }',
      '}'
    ];
    return config.join('\n');
  });

  fs.writeFileSync(NGINX_CONF_FILE, configs.join('\n\n'));
  exec(NGINX_RELOAD_COMMAND);
});
