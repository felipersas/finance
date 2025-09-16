FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Start command
CMD ["npm", "run", "start"]
