module.exports = function(fetch) {
  console.log('[' + fetch.repo + '] fetch ' + fetch.commit);
  fetch.accept();
};
