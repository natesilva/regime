var log = require('./log.js');

module.exports = function(fetch) {
  log.info('[' + fetch.repo + '] fetch ' + fetch.commit);
  fetch.accept();
};
