# Use Node.js 20 LTS as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose Mastra default port (adjust if needed)
EXPOSE 4111

# Start in development mode
CMD ["npm", "run", "dev"]

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/.mastra ./.mastra
COPY --from=builder /app/src ./src

# Expose Mastra port
EXPOSE 4111

# Start in production mode
CMD ["npm", "run", "start"]
