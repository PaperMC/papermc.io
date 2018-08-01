FROM abiosoft/caddy:0.11.0
ADD Caddyfile.docker /etc/Caddyfile
ADD src/ /srv