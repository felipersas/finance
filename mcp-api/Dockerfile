# Multi-stage build for NestJS - Optimized for cache
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies in a separate layer for better caching
FROM base AS deps

# Copy only dependency files first (better cache)
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci && npm cache clean --force

# Generate Prisma client in deps stage
RUN npx prisma generate

# Development stage
FROM deps AS development

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command
CMD ["npm", "run", "start:dev"]

# Build stage - only runs when needed
FROM deps AS build

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
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN npm ci --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Production command - direct node for faster startup
CMD ["node", "dist/main"]
