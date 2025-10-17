# MCP Development Environment

This repository contains a complete development environment for the MCP (Model Context Protocol) ecosystem.

## Services Overview

### 1. **mcp-api** (Port 3000)
- **Technology**: NestJS, Prisma ORM, PostgreSQL
- **Purpose**: Main API with authentication, user management, CSV processing, and analytics
- **Database**: PostgreSQL with Prisma ORM
- **Features**: JWT authentication, file upload, RESTful APIs, vector embeddings support

### 2. **PostgreSQL Database** (Port 5433)
- **Technology**: PostgreSQL 18 with pgvector extension
- **Purpose**: Main database with vector embeddings support
- **Features**: Persistent data storage, health checks, vector similarity search

### 3. **startapp** (Ports 8081, 19000-19002)
- **Technology**: React Native, Expo, TypeScript
- **Purpose**: Mobile/web frontend application
- **Features**: Cross-platform mobile app with financial tracking functionality</parameter>

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
   # PostgreSQL Configuration
   POSTGRES_DB=extrato_db
   POSTGRES_USER=mcpuser
   POSTGRES_PASSWORD=mcppassword

   # API Configuration
   JWT_SECRET=your-custom-jwt-secret
   JWT_EXPIRES_IN=7d
   INTERNAL_API_TOKEN=your-internal-api-token
   ```</parameter>
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

- **expo-app**:
  - Metro bundler: http://localhost:8081
  - Expo DevTools: http://localhost:19000

- **PostgreSQL**: localhost:5433
  - User: mcpuser
  - Password: mcppassword
  - Database: extrato_db</parameter>
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

# Generate Prisma Client
docker-compose exec mcp-api npm run prisma:generate

# Access Prisma Studio
docker-compose exec mcp-api npm run prisma:studio

# Access PostgreSQL directly
docker-compose exec db psql -U mcpuser -d extrato_db

# View PostgreSQL tables
docker-compose exec db psql -U mcpuser -d extrato_db -c "\dt"
```</parameter>
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

### MCP API Usage</parameter>
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

1. **Database Connection Errors**
   ```
   Error: Can't connect to PostgreSQL server
   ```
   **Solution**: Wait for PostgreSQL to fully start (check with `docker-compose logs db`)

2. **Port Conflicts**</parameter>
3. **Port Conflicts**
   ```
   Error: Port 3000 is already in use
   ```
   **Solution**: Stop conflicting services or change ports in `docker-compose.yml`

3. **Prisma Migration Issues**
   ```
   Error: Migration failed
   ```
   **Solution**: Reset database with `docker-compose exec mcp-api npm run prisma:migrate:reset`

4. **pgvector Extension Issues**
   ```
   Error: extension "vector" not found
   ```
   **Solution**: Verify extension is enabled with `docker-compose exec db psql -U mcpuser -d extrato_db -c "CREATE EXTENSION IF NOT EXISTS vector;"`</parameter>

### Debugging Commands
```bash
# Check container status
docker-compose ps

# Access container shell
docker-compose exec mcp-api sh

# Check database connectivity
docker-compose exec db pg_isready -U mcpuser -d extrato_db</parameter>

# View service logs in real-time
docker-compose logs -f mcp-api
```

### Performance Optimization
- **Development**: Services use volume mounts for hot-reload
- **Production**: Use multi-stage builds and optimized images
- **Database**: Persistent volumes ensure data survives container restarts

## Architecture Notes

### Service Communication
- **mcp-api** ↔ **PostgreSQL**: Direct database connection via Prisma ORM
- **startapp** ↔ **mcp-api**: HTTP REST API calls

### Network Configuration
- All services run on a custom Docker network (`mcp-network`)
- Services communicate using container names as hostnames
- External access via mapped ports on localhost

### Data Flow
1. **Mobile App** sends requests to **mcp-api**
2. **mcp-api** processes requests and queries **PostgreSQL** database
3. Response flows back to the mobile app

### Database Features
- **Vector Embeddings**: pgvector extension enables similarity search
- **Prisma ORM**: Type-safe database access with automatic migrations
- **Health Checks**: Ensures database availability before starting dependent services</parameter>

## PostgreSQL Migration

This project has been migrated from MySQL to PostgreSQL with pgvector support. For detailed PostgreSQL setup instructions, see [POSTGRES_SETUP.md](./POSTGRES_SETUP.md).

### Key Changes
- Database: MySQL 8.0 → PostgreSQL 18 with pgvector
- Port: 3306 → 5433 (dev) / 5432 (prod)
- Vector Support: Enabled vector embeddings for AI/ML features

## Contributing

1. Make changes to source code in respective directories
2. Services will automatically reload (development mode)
3. For database schema changes, run migrations in the mcp-api container
4. Test changes across all affected services</parameter>
4. Test changes across all affected services

## Security Notes

- **Development Only**: This configuration is for development environments
- **Production**: Use proper secrets management, environment-specific configs
- **Database**: Change default passwords before deploying
- **API Keys**: Never commit real API keys to version control
