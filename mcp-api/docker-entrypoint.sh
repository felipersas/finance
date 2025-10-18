#!/bin/sh
set -e

echo "🚀 Starting MCP API..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until pg_isready -h db -p 5432 -U ${POSTGRES_USER:-mcpuser} > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
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
