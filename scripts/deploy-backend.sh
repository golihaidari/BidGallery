#!/bin/bash
ENVIRONMENT=${1:-dev}

echo "Deploying backend ($ENVIRONMENT)..."

# Build image
docker build -t bidgallery-backend -f backend/Dockerfile backend

# Stop existing container
docker stop backend 2>/dev/null || true
docker rm backend 2>/dev/null || true

echo "Starting ($ENVIRONMENT) container..."
if [ "$ENVIRONMENT" = "prod" ]; then
    docker run -d \
      --name backend \
      --network bidgallery_database-network \
      --network bidgallery_monitoring-network \
      -p 8080:8080 \
      --env-file backend/.env.production \
      bidgallery-backend
    
    echo "Backend PRODUCTION deployed!"
else
    # DEVELOPMENT
    echo "Starting development container..."
    docker run -d \
      --name backend \
      --network bidgallery_database-network \
      --network bidgallery_monitoring-network \
      -p 8080:8080 \
      --env-file backend/.env.development \
      bidgallery-backend
      
fi
echo "Backend ($ENVIRONMENT) deployed!"

echo "⏳ Waiting for startup..."
sleep 20

curl -f http://localhost:8080/actuator/health && echo "Backend is healthy!" || echo "Alert: Check docker logs backend"