FROM abiosoft/caddy:0.11.0
ADD Caddyfile.docker /etc/Caddyfile
RUN ["yarn", "run", "build"]
ADD dist/ /srv