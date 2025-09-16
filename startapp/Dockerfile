FROM node:18-alpine

WORKDIR /app

# Install Expo CLI globally
RUN npm install -g @expo/cli@latest

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose ports for Expo
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start Expo development server
CMD ["npx", "expo", "start", "--dev-client", "--tunnel"]
