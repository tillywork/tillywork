#!/bin/sh

# Start nginx
nginx -g 'daemon off;' &

# Start all applications defined in ecosystem.config.js
pm2-runtime ecosystem.config.js