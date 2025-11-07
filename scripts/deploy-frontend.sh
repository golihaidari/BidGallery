#!/bin/bash
ENVIRONMENT=${1:-dev}

echo "Deploying frontend ($ENVIRONMENT)..."

# Stop existing container
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# Build image
docker build -t bidgallery-frontend -f frontend/Dockerfile frontend

if [ "$ENVIRONMENT" = "prod" ]; then
    #docker build -t bidgallery-frontend -f frontend/Dockerfile frontend
    
    echo "Starting production container..."
    docker run -d \
      --name frontend \
      --network bidgallery_database-network \
      -p 3000:80 \
      --env-file frontend/.env.production \
      bidgallery-frontend
    
    echo "Frontend PRODUCTION deployed at: http://localhost:3000"

else    
    #docker build -t bidgallery-frontend-dev -f frontend/Dockerfile frontend
    
    echo "Starting development container..."
    docker run -d \
      --name frontend \
      --network bidgallery_database-network \
      -p 5173:80 \
      --env-file frontend/.env.development \
      bidgallery-frontend-dev
    
    echo "Frontend DEVELOPMENT deployed at: http://localhost:5173"
fi


# Health check
echo "Frontend start..."
sleep 15

if [ "$ENVIRONMENT" = "prod" ]; then
    curl -f http://localhost:3000 && echo "Frontend is healthy!" || echo "Alert: Check docker logs frontend"
else
    curl -f http://localhost:5173 && echo "Frontend is healthy!" || echo "Alert: Check docker logs frontend"
fi