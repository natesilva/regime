## Adding regime to your Ubuntu (Upstart) init

1. If exposed to the Internet, configure the firewall to block traffic on port 2677 except from trusted hosts.
2. Install prerequisites: `node` (of course) and `git`.
3. Install regime:   
    `sudo npm install -g regime`
4. Create a user for regime:   
    `adduser --shell /usr/sbin/nologin --disabled-login regime`
5. Make a directory to host the app repos:   
    `mkdir -m700 ~regime/repos && chown regime:regime ~regime/repos`
6. Make a directory for logfiles:   
    `mkdir -m700 ~regime/logs && chown regime:regime ~regime/logs`
7. Copy the `regime.conf` script to the `/etc/init` directory.
8. Start the app:   
    `start regime`
9. Check for errors:   
    `status regime` (should report start/running)   
    `tail ~regime/logs/regime.log`
