#!/bin/bash
echo "📊 Starting monitoring..."
docker-compose -f docker-compose.monitoring.yml up -d
echo "✅ Monitoring started!"
echo "   Grafana: http://localhost:3000 (admin/admin)"
echo "   Prometheus: http://localhost:9090"