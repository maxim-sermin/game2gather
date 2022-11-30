#!/bin/sh
export DOLLAR='$'
envsubst < /var/nginx.conf.template > /etc/nginx/nginx.conf

echo "Replacing environment specific variables for Angular"
envsubst < /usr/share/nginx/html/assets/environment-specific.template.json > /usr/share/nginx/html/assets/environment-specific.json
echo "Result: " && cat /usr/share/nginx/html/assets/environment-specific.json

nginx -g "daemon off;"
