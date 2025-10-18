# Multi-stage build for Mastra - Optimized for cache
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies in a separate layer for better caching
FROM base AS deps

# Copy only dependency files first (better cache)
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Development stage
FROM deps AS development

# Copy source code
COPY . .

# Expose Mastra default port
EXPOSE 4111

# Start in development mode
CMD ["npm", "run", "dev"]

# Builder stage
FROM deps AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - optimized and minimal
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.mastra ./.mastra
COPY --from=builder /app/src ./src

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mastra -u 1001 && \
    chown -R mastra:nodejs /app

USER mastra

# Expose Mastra port
EXPOSE 4111

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4111/health || exit 1

# Start in production mode
CMD ["npm", "run", "start"]
