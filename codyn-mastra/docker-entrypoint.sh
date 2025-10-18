#!/bin/sh
set -e

echo "🚀 Starting Codyn Mastra..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z mcp_db 5432 > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "✅ Database is ready!"

# Give database a bit more time to fully initialize
sleep 3

# Start the Mastra application
echo "🎯 Starting Mastra application..."
exec npm run start
