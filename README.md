# regime

Use Git to deploy Node.js apps on your server, and control them.

# status

Early days. No docs. Expect bugs.

# install

    npm install regime

# example

## Server:

    $ regime /my/repos
    
    >>> regime is listening on IPv4 port 2677
    
## Developer:

    $ git push http://regime-server:2677/yourNodeApp master
    
    # yourNodeApp is now running on the server
    
# notable features

* Auto-assignment of port numbers to running apps (for use behind a proxy).
* Hook that gets called when config changes. For example, update and reload nginx config.
* Hook that gets called when an app crash is detected.
* API for querying status of apps, starting and stopping apps.
* Middleware to support your own authentication for git and API access.
