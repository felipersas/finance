FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start command using node --experimental-loader for ES modules
CMD ["sh", "-c", "node --input-type=module /app/mcp-server-extrato/build/main.js &  sleep 2 && node build/index.js /app/mcp-server-extrato/build/main.js"]
