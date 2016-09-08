#!/bin/sh

heroku config:set NODE_ENV=production
heroku config:set FORGE_CLIENTID=$FORGE_CLIENT_ID
heroku config:set FORGE_CLIENTSECRET=$FORGE_CLIENT_SECRET
