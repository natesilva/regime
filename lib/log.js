var path = require('path');

var options = {
  name: 'regime'
};

if (process.env.LOG_DIR) {
  options.streams = [{
    type: 'rotating-file',
    path: path.join(process.env.LOG_DIR, 'regime.log'),
    period: '1d',
    count: 30
  }];
}

module.exports = require('bunyan').createLogger(options);
