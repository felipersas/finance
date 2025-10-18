#!/bin/sh
set -e

echo "🚀 Starting MCP API V2..."

# Wait for database to be ready
echo "⏳ Waiting for database..."

# Maximum wait time (in seconds)
MAX_WAIT=120
ELAPSED=0

# First, wait for DNS resolution
until getent hosts db > /dev/null 2>&1; do
  echo "Waiting for database DNS resolution..."
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "❌ Timeout waiting for database DNS resolution"
    exit 1
  fi
done

echo "✅ Database DNS resolved!"

# Reset timer for connection check
ELAPSED=0

# Now wait for database port to be accessible using pg_isready
until pg_isready -h db -p 5432 -U ${POSTGRES_USER:-mcpuser} > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "❌ Timeout waiting for database connection"
    exit 1
  fi
done

echo "✅ Database is ready!"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"

# Start the application
echo "🎯 Starting NestJS application..."
exec node dist/main
