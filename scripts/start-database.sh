#!/bin/bash
echo "🗄️ Starting database..."
docker-compose -f docker-compose.database.yml up -d
echo "✅ Database started! JPA will create tables when backend runs."