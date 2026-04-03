#!/bin/sh
set -e

# Default to a non-privileged port for non-root Nginx runtime
PORT="${PORT:-8080}"

echo "--> PORT is $PORT"
echo "--> Generating Nginx configuration..."

# Substitute environment variables
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "--> Starting Nginx..."
# Start Nginx
exec nginx -g 'daemon off;'
