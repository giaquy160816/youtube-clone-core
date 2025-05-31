#!/bin/bash

case "$1" in
  dev)
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up dev
    ;;
  stop)
    docker-compose stop nestjs-dev
    ;;
  restart)
    docker-compose restart nestjs-dev
    ;;
  *)
    echo "Usage: ./docker-shortcuts.sh [dev|stop|restart]"
    ;;
esac