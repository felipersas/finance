# Finance

A full-stack personal finance management platform with AI integration. Import bank statements via CSV, auto-categorize transactions, visualize financial analytics, and interact with a financial chatbot via SSE streaming.

## Architecture Overview

```
finance/
├── mcp-api/          # REST API (NestJS) - Main backend
├── startapp/         # Mobile App (Expo / React Native)
├── finance/          # Web Monorepo (Turborepo / Next.js)
│   ├── apps/
│   │   ├── web/      # Web Frontend (Next.js + tRPC + shadcn/ui)
│   │   └── server/   # Server-side app
│   └── packages/
│       ├── db/       # Shared Prisma ORM package
│       ├── auth/     # Shared authentication package (better-auth)
│       └── api/      # Shared tRPC client
├── docs/             # Deployment and infrastructure documentation
├── scripts/          # Setup and automation scripts
└── docker-compose*.yml
```

## Tech Stack

### Backend (mcp-api)
| Technology | Purpose |
|---|---|
| **NestJS** | Main HTTP framework |
| **Prisma ORM** | Object-relational mapping and migrations |
| **PostgreSQL** | Relational database |
| **JWT** | Stateless authentication |
| **SSE** | Chatbot response streaming |
| **Docker** | Containerization |

### Mobile (startapp)
| Technology | Purpose |
|---|---|
| **Expo SDK 52** | Cross-platform mobile framework |
| **React Native** | Native UI for iOS/Android |
| **Expo Router** | File-based navigation |
| **NativeWind v4** | Tailwind CSS for React Native |
| **React Query** | Server state management |
| **EAS Build** | Cloud build and deployment |

### Web (finance/)
| Technology | Purpose |
|---|---|
| **Next.js 15** | Full-stack React framework |
| **Turborepo** | Monorepo build system |
| **Bun** | Runtime and package manager |
| **tRPC** | End-to-end type-safe API |
| **shadcn/ui** | UI component library |
| **Tailwind CSS** | Styling |
| **better-auth** | Authentication |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | Container orchestration (dev + prod) |
| **Docker Swarm** | Production orchestration |
| **Traefik** | Reverse proxy with automatic SSL |
| **GitHub Actions** | CI/CD pipelines |

## API Modules (mcp-api)

The backend follows **Hexagonal Architecture** (Ports & Adapters), separating domain logic from infrastructure:

| Module | Description |
|---|---|
| **auth** | JWT authentication (login, register, refresh token) |
| **user** | User management |
| **csv** | Bank statement CSV upload and parsing |
| **extracts** | Imported bank statement management |
| **analytics** | Financial reports and dashboard data |
| **chatbot** | AI-powered financial chatbot (SSE streaming) |
| **notification** | Push notifications |

### Hexagonal Structure (per module)

```
module/
├── domain/          # Entities, port interfaces (pure business logic)
├── application/     # Use cases, application services
├── infrastructure/  # Adapters: Prisma repositories, HTTP controllers
└── module.ts        # NestJS module definition
```

### Shared Common Layer

```
common/
├── decorators/      # Custom decorators
├── dtos/            # Data Transfer Objects
├── errors/          # Error classes
├── exceptions/      # Exception filters
├── interceptors/    # Request interceptors
├── services/        # Shared services
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Database Schema (Prisma)

Prisma ORM manages migrations and PostgreSQL access. Key entities:

- **User** - Platform users
- **Extract** - Imported bank statements
- **Transaction** - Financial transactions
- **Category** - Transaction categories

Versioned migrations in `mcp-api/prisma/migrations/`.

Index optimization available at `optimize-indexes.sql`.

## Mobile App (startapp)

### Screens

| Route | Description |
|---|---|
| `/splash` | Splash screen |
| `/sign-in` | Login |
| `/sign-up` | Registration |
| `/(private)/(tabs)/` | Authenticated area (tab navigation) |
| `/(private)/(tabs)/index` | Main dashboard |
| `/(private)/(tabs)/transacoes` | Transaction list |
| `/(private)/(tabs)/alertas-lembretes` | Financial alerts and reminders |

### Components

| Directory | Description |
|---|---|
| `auth/` | Authentication components |
| `chat/` | Chatbot interface |
| `transactions/` | Transaction cards and lists |
| `notifications/` | Notification components |
| `form/` | Inputs and forms |
| `layout/` | Layout and navigation |
| `ui/` | Base components (shadcn-inspired) |
| `common/` | Shared components |

### Hooks

| Hook | Description |
|---|---|
| `useAnalytics` | Dashboard/analytics data |
| `useChatApi` | Chatbot integration (SSE) |
| `useUploadCsv` | CSV statement upload |
| `useListExtract` | Imported statements listing |
| `useNotifications` | Notification management |
| `useStorageState` | Locally persisted state |
| `mutations/` | React Query mutations |

### Providers

- **SessionProvider** - Authenticated session management
- **QueryProvider** - React Query (TanStack Query) for caching and server state

## Web Monorepo (finance/)

Turborepo structure with shared apps and packages:

- **apps/web** - Next.js 15 with App Router, tRPC, shadcn/ui, Tailwind CSS, Mastra AI
- **apps/server** - Server build with tsdown
- **packages/db** - Shared Prisma schema with Docker Compose for local PostgreSQL
- **packages/auth** - Shared better-auth
- **packages/api** - Type-safe tRPC client

## Infrastructure & Deployment

### Docker Compose (Development)

```bash
docker-compose up -d
```

Starts PostgreSQL + API + dependencies.

### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Docker Swarm deployment with Traefik as reverse proxy with automatic SSL.

### CI/CD

Pipeline configured via GitHub Actions (`.github/workflows/`).

### Scripts

| Script | Description |
|---|---|
| `deploy.sh` | Automated deployment script |
| `scripts/setup-vps.sh` | Full VPS provisioning |
| `optimize-indexes.sql` | PostgreSQL index optimization |

### Infrastructure Documentation

| Document | Description |
|---|---|
| `docs/QUICK_START_DEPLOY.md` | Quick deploy guide |
| `docs/DEPLOY-SWARM-GUIDE.md` | Docker Swarm deployment guide |
| `docs/TRAEFIK_CONFIG.md` | Traefik configuration |
| `docs/CICD_SETUP.md` | CI/CD setup guide |
| `DEPLOY_OPTIMIZATION.md` | Deployment optimizations |

## Getting Started

### Requirements

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use via Docker)
- Expo CLI (for mobile)

### Setup

```bash
# Clone the repository
git clone https://github.com/felipersas/finance.git
cd finance

# Copy environment variables
cp .env.example .env

# Start the database
docker-compose up -d

# API (mcp-api)
cd mcp-api
npm install
npx prisma migrate dev
npm run start:dev

# Mobile (startapp)
cd ../startapp
npm install
npx expo start

# Web (finance/)
cd ../finance
bun install
bun run dev
```

## License

Private project. All rights reserved.
