# MCP Development Environment

This repository contains a complete development environment for the MCP (Model Context Protocol) ecosystem with four interconnected services:

## Services Overview

### 1. **mcp-api** (Port 3000)
- **Technology**: NestJS, Prisma ORM, MySQL
- **Purpose**: Main API with authentication, user management, CSV processing, and chatbot integration
- **Database**: MySQL with Prisma ORM
- **Features**: JWT authentication, file upload, RESTful APIs

### 2. **mcp-chatbot** (Port 3001)
- **Technology**: Node.js, Express, OpenAI integration
- **Purpose**: Chatbot service that interfaces with MCP servers using OpenAI
- **Features**: Conversation history, tool calling, MCP client integration

### 3. **mcp-server-extrato** (Ports 3002-3003)
- **Technology**: TypeScript, MCP SDK, MySQL
- **Purpose**: MCP server for financial data (extrato) and weather data processing
- **Features**: Database operations, weather API integration, financial analysis

### 4. **startapp** (Ports 8081, 19000-19002)
- **Technology**: React Native, Expo, TypeScript
- **Purpose**: Mobile/web frontend application
- **Features**: Cross-platform mobile app with chat functionality

### 5. **mysql** (Port 3306)
- **Technology**: MySQL 8.0
- **Purpose**: Shared database for mcp-api and mcp-server-extrato
- **Features**: Persistent data storage, health checks

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API key
- Git

### Setup Instructions

1. **Clone and navigate to the repository**
   ```bash
   cd /path/to/your/mcp/directory
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file with your actual values**
   ```bash
   # Required: Add your OpenAI API key
   OPENAI_API_KEY=your-actual-openai-api-key-here

   # Optional: Customize other values if needed
   JWT_SECRET=your-custom-jwt-secret
   MYSQL_ROOT_PASSWORD=your-custom-password
   ```

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Check service health**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Service URLs

After starting with Docker Compose:

- **mcp-api**: http://localhost:3000
  - Health check: http://localhost:3000
  - API docs: http://localhost:3000/api (if Swagger is configured)

- **mcp-chatbot**: http://localhost:3001
  - Health check: http://localhost:3001/health
  - Chat endpoint: http://localhost:3001/chat

- **mcp-server-extrato**:
  - REST API: http://localhost:3002
  - MCP HTTP: http://localhost:3003

- **expo-app**:
  - Metro bundler: http://localhost:8081
  - Expo DevTools: http://localhost:19000

- **MySQL**: localhost:3306
  - User: mcpuser
  - Password: mcppassword
  - Database: mcp_database

## Development Workflow

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d mysql mcp-api

# Start with logs
docker-compose up
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mcp-api
```

### Database Operations
```bash
# Run Prisma migrations
docker-compose exec mcp-api npm run prisma:migrate:dev

# Access Prisma Studio
docker-compose exec mcp-api npm run prisma:studio

# Access MySQL directly
docker-compose exec mysql mysql -u mcpuser -p mcp_database
```

### Development Commands
```bash
# Rebuild services after code changes
docker-compose build
docker-compose up -d

# Restart specific service
docker-compose restart mcp-api

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete database data)
docker-compose down -v
```

## Mobile Development (Expo)

The React Native app runs in the `expo-app` container with Expo CLI. To develop:

1. **Install Expo Go app** on your mobile device
2. **Connect to the same network** as your Docker host
3. **Scan the QR code** from the Expo DevTools at http://localhost:19000
4. **For web development**, visit the web URL provided in the logs

### Expo Development Notes
- The app is configured to use tunnel mode for easy mobile device connection
- Metro bundler runs on port 8081
- Expo DevTools run on ports 19000-19002

## API Integration

### Chat API Usage
```javascript
// Example: Send message to chatbot
const response = await fetch('http://localhost:3001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'Show me financial summary for last month',
    conversationId: 'user-123'
  })
});
```

### MCP API Usage
```javascript
// Example: Authentication
const authResponse = await fetch('http://localhost:3000/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**
   ```
   Error: OPENAI_API_KEY is not set
   ```
   **Solution**: Add your OpenAI API key to the `.env` file

2. **Database Connection Errors**
   ```
   Error: Can't connect to MySQL server
   ```
   **Solution**: Wait for MySQL to fully start (check with `docker-compose logs mysql`)

3. **Port Conflicts**
   ```
   Error: Port 3000 is already in use
   ```
   **Solution**: Stop conflicting services or change ports in `docker-compose.yml`

4. **Prisma Migration Issues**
   ```
   Error: Migration failed
   ```
   **Solution**: Reset database with `docker-compose exec mcp-api npm run prisma:migrate:reset`

### Debugging Commands
```bash
# Check container status
docker-compose ps

# Access container shell
docker-compose exec mcp-api sh

# Check database connectivity
docker-compose exec mysql mysqladmin ping -h localhost

# View service logs in real-time
docker-compose logs -f mcp-api
```

### Performance Optimization
- **Development**: Services use volume mounts for hot-reload
- **Production**: Use multi-stage builds and optimized images
- **Database**: Persistent volumes ensure data survives container restarts

## Architecture Notes

### Service Communication
- **mcp-api** ↔ **mysql**: Direct database connection
- **mcp-chatbot** ↔ **mcp-server-extrato**: MCP protocol via stdio/http
- **startapp** ↔ **mcp-api**: HTTP REST API calls
- **mcp-server-extrato** ↔ **mysql**: Direct database connection for weather/financial data

### Network Configuration
- All services run on a custom Docker network (`mcp-network`)
- Services communicate using container names as hostnames
- External access via mapped ports on localhost

### Data Flow
1. **Mobile App** sends chat request to **mcp-api**
2. **mcp-api** forwards to **mcp-chatbot**
3. **mcp-chatbot** uses **mcp-server-extrato** for data processing
4. **mcp-server-extrato** queries **mysql** database
5. Response flows back through the chain to the mobile app

## Contributing

1. Make changes to source code in respective directories
2. Services will automatically reload (development mode)
3. For database schema changes, run migrations in the mcp-api container
4. Test changes across all affected services

## Security Notes

- **Development Only**: This configuration is for development environments
- **Production**: Use proper secrets management, environment-specific configs
- **Database**: Change default passwords before deploying
- **API Keys**: Never commit real API keys to version control
