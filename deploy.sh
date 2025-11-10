#!/bin/bash
set -e

echo "Starting deployment..."

echo "Cleaning local repository and pulling latest changes..."
git reset --hard HEAD
git pull origin main

echo "Rebuilding and restarting Docker container..."
docker compose up --build -d

echo "Pruning old Docker images..."
docker image prune -f

echo "✅ Deployment complete!"