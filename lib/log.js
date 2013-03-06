var options = {
  name: 'regime'
};

if (process.env.LOG_PATH) {
  options.streams = [{path: process.env.LOG_PATH}];
}

module.exports = require('bunyan').createLogger(options);
