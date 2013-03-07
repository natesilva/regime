//
// Requires repo users to authenticate.
//
// DOES NOT require auth to use the config API (for that, you would
// create a similar file called adminMiddleware.js).
//
// Place this in a git repo, then push the repo with the name
// “_regime”.
//

var USERNAME = 'gituser';
var PASSWORD = 'bigsecret';

module.exports = function(req, res, next) {
  var header=req.headers.authorization || '',         // get the header
      token=header.split(/\s+/).pop() || '',          // and encoded auth token
      auth=new Buffer(token, 'base64').toString(),    // convert from base64
      parts=auth.split(':'),                          // split on colon
      username=parts[0],
      password=parts[1];

  if (username === USERNAME && password === PASSWORD) {
    next();
  } else {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="regime"');
    res.end('401 Unauthorized');
  }
};
