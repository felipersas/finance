#!/bin/bash

set -e

echo "🚀 Starting production deployment..."


# Check if SSL certificates exist
if [ ! -d ".nginx/ssl" ]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "Please add your SSL certificates or the deployment will use HTTP only."
    mkdir -p nginx/ssl
fi

# Create nginx directory if it doesn't exist
mkdir -p .nginx

# Load environment variables
export $(cat .env.prod | grep -v '#' | xargs)

echo "🔧 Building and starting services..."

# Stop existing containers
docker compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if you want to rebuild everything)
# docker compose -f docker-compose.prod.yml build --no-cache

# Start services
docker compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to be healthy..."

# Wait for services to be healthy
timeout 120 bash -c 'until docker compose -f docker-compose.prod.yml ps | grep -q "healthy"; do sleep 5; done'

echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 Services are running on:"
echo "   - API: https://your-domain.com/api"
echo "   - Health check: https://your-domain.com/health"
echo ""
echo "📋 To check logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f [service_name]"
echo ""
echo "📋 To check status:"
echo "   docker compose -f docker-compose.prod.yml ps"
