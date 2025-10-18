#!/bin/sh
set -e

echo "🚀 Starting Codyn Mastra..."

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

# Now wait for database port to be accessible
until nc -z db 5432 > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "❌ Timeout waiting for database connection"
    exit 1
  fi
done

echo "✅ Database is ready!"

# Give database a bit more time to fully initialize
sleep 3

# Start the Mastra application
echo "🎯 Starting Mastra application..."
# exec npm run start
node --import=./.mastra/output/instrumentation.mjs .mastra/output/index.mjs
