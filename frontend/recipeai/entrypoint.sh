#!/bin/sh
set -e

# Check if required environment variables are set
if [ -z "$PORT" ]; then
  echo "--> Error: PORT environment variable is not set."
  exit 1
fi

if [ -z "$BACKEND_URL" ]; then
  echo "--> Error: BACKEND_URL environment variable is not set."
  echo "--> Please set this to the internal URL of your backend service in Railway."
  exit 1
fi

echo "--> PORT is $PORT"
echo "--> BACKEND_URL is $BACKEND_URL"
echo "--> Generating Nginx configuration..."

# Substitute environment variables
envsubst '${PORT},${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "--> Starting Nginx..."
# Start Nginx
exec nginx -g 'daemon off;'
