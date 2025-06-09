#!/bin/bash

case "$1" in
  dev)
    echo "🔧 Starting NestJS Dev (with override for local node_modules)..."
    docker-compose -f docker-compose.yml up dev
    ;;
  stop)
    echo "🛑 Stopping NestJS Dev container..."
    docker-compose stop nestjs-dev
    ;;
  restart)
    echo "🔄 Restarting NestJS Dev container..."
    docker-compose restart nestjs-dev
    ;;
  logs)
    echo "📜 Following logs for NestJS Dev..."
    docker-compose -f docker-compose.yml logs -f dev
    ;;
  *)
    echo "⚠️  Usage: ./docker-shortcuts.sh [dev|stop|restart|logs]"
    ;;
esac


#./docker-shortcuts.sh dev      # Start dev server
#./docker-shortcuts.sh stop     # Stop dev container
#./docker-shortcuts.sh restart  # Restart dev container
#./docker-shortcuts.sh logs     # Xem logs