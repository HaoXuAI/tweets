#!/usr/bin/env bash
if [ ! -z "$DEPLOYMENT_GROUP_NAME" ]; then
 export NODE_ENV=$DEPLOYMENT_GROUP_NAME
fi

cd ~/tweet_js/bin
pm2 start www -n www -i 0
# node www
