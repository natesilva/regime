## Adding regime to your Ubuntu (Upstart) init

1. If exposed to the Internet, configure the firewall to block traffic on port 2677 except from trusted hosts.
2. Install regime:   
    `sudo npm install -g regime`
3. Create a user for regime:   
    `adduser --shell /usr/sbin/nologin --disabled-login regime`
4. Make a directory to host the app repos:   
    `mkdir -m700 ~regime/repos && chown regime:regime ~regime/repos`
5. Make a directory for logfiles:   
    `mkdir -m700 ~regime/logs && chown regime:regime ~regime/logs`
6. Copy the `regime.conf` script to the `/etc/init` directory.
7. Start the app:   
    `start regime`
8. Check for errors:   
    `status regime` (should report start/running)   
    `tail ~regime/logs/regime.log`
