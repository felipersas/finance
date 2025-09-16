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

# Start command with the correct path
CMD ["sh", "-c", "node build/index.js /app/mcp-server-extrato/build/main.js"]
