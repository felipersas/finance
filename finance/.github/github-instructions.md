# GitHub Copilot Instructions - Finance Project

## Project Overview

This is a **Finance** application built with the [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) monorepo architecture using TypeScript, featuring a Next.js frontend, Elysia backend with tRPC, and PostgreSQL database with Prisma ORM.

### Tech Stack
- **Language**: TypeScript (ESNext, strict mode)
- **Runtime**: Bun
- **Frontend**: Next.js 16 (App Router), React 19
- **Backend**: Elysia server with tRPC API
- **Database**: PostgreSQL with Prisma ORM (Docker setup)
- **Authentication**: Better-Auth with Polar.sh integration
- **Monorepo**: Turborepo with npm workspaces
- **Styling**: TailwindCSS 4 with shadcn/ui components
- **AI Integration**: Google Gemini (via AI SDK)
- **State Management**: TanStack Query (React Query)
- **Package Manager**: npm 10.9.2

## Project Structure

```
finance/
├── apps/
│   ├── web/          # Next.js frontend (port 3001)
│   │   └── src/
│   │       ├── app/          # Next.js App Router pages
│   │       ├── components/   # React components
│   │       ├── actions/      # Server actions
│   │       ├── hooks/        # Custom React hooks
│   │       ├── lib/          # Client utilities
│   │       ├── mastra/       # AI/Mastra integration
│   │       └── utils/        # Helper utilities
│   └── server/       # Elysia backend (port 3000)
│       └── src/
│           ├── index.ts      # Server entry, routes setup
│           └── auth-guard.ts # Auth middleware
├── packages/
│   ├── api/          # tRPC API layer & business logic
│   │   └── src/
│   │       ├── index.ts      # tRPC setup
│   │       ├── context.ts    # Context creation
│   │       ├── routers/      # tRPC routers
│   │       └── services/     # Business logic
│   ├── auth/         # Better-Auth configuration
│   │   └── src/
│   └── db/           # Prisma database layer
│       ├── prisma/
│       │   └── schema/       # Prisma schema files
│       └── src/
└── package.json      # Root package with workspaces
```

## Development Workflow

### Package Manager
- **ALWAYS use `npm`** (specified in package.json: `"packageManager": "npm@10.9.2"`)
- Never use bun/yarn/pnpm for package management

### Common Commands

**Development:**
```bash
npm run dev              # Start all apps (web + server)
npm run dev:web          # Start web only (port 3001)
npm run dev:server       # Start server only (port 3000)
npm run dev:native       # Start native app (if applicable)
```

**Build & Type Checking:**
```bash
npm run build            # Build all packages/apps
npm run check-types      # TypeScript type checking
```

**Database:**
```bash
npm run db:start         # Start PostgreSQL (Docker)
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:watch         # Watch Docker compose logs
npm run db:stop          # Stop database
npm run db:down          # Stop & remove containers
```

**tRPC:**
```bash
npm run trpc:generate    # Generate tRPC types
```

### Development Server Setup
1. Start database: `npm run db:start`
2. Push schema: `npm run db:push`
3. Start dev servers: `npm run dev`
4. Access:
   - Web: http://localhost:3001
   - API: http://localhost:3000

## Architecture Patterns

### Monorepo Workspace Structure
- Uses **npm workspaces** with internal package references (`@finance/*`)
- Packages use source exports (src/) in dev, dist/ in production
- Turborepo manages task pipelines and caching

### API Layer (tRPC)
- **Location**: `packages/api/src/routers/`
- **Pattern**: tRPC procedures with type-safe context
- **Authentication**: Uses `protectedProcedure` for authenticated routes
- **Available Routers**:
  - `csv.router.ts` - CSV import/export
  - `dashboard.router.ts` - Dashboard data
  - `products.router.ts` - Product management
  - `transactions.router.ts` - Financial transactions
  - `users.router.ts` - User management

### Backend (Elysia Server)
- **Entry**: `apps/server/src/index.ts`
- **Routes**:
  - `/api/auth/*` - Better-Auth endpoints
  - `/trpc/*` - tRPC API handler
  - `/ai` - AI streaming endpoint (Google Gemini)
  - `/user` - Protected user endpoint
- **CORS**: Configured for cross-origin requests
- **Port**: 3000

### Frontend (Next.js)
- **Framework**: Next.js 16 with App Router
- **React**: Version 19 with Compiler
- **Features**:
  - Server Components by default
  - Client Components marked with `'use client'`
  - Server Actions in `src/actions/`
  - tRPC client integration via TanStack Query
- **Styling**: TailwindCSS 4 with shadcn/ui components
- **Port**: 3001

### Database (Prisma)
- **Schema Location**: `packages/db/prisma/schema/`
  - `schema.prisma` - Main schema
  - `auth.prisma` - Better-Auth tables
- **Provider**: PostgreSQL
- **Setup**: Docker Compose (in db package)
- **Client**: Auto-generated, exported from `@finance/db`

### Authentication (Better-Auth)
- **Package**: `@finance/auth`
- **Integration**: Polar.sh Better-Auth plugin
- **Context**: Available in tRPC procedures via `ctx.session`
- **Middleware**: `protectedProcedure` for protected routes

## Code Style & Conventions

### TypeScript
- **Strict mode enabled** with comprehensive checks
- **Module system**: ESNext with bundler resolution
- **Important flags**:
  - `noUncheckedIndexedAccess: true`
  - `noUnusedLocals: true`
  - `verbatimModuleSyntax: true`
- Use **Zod** for runtime validation
- Avoid `any`, prefer `unknown` for unknowns

### Imports
- **Internal packages**: Use workspace aliases (`@finance/api`, `@finance/db`, `@finance/auth`)
- **Server-only code**: Import from `server-only` package
- **Client-only code**: Import from `client-only` package

### File Naming
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/Services**: camelCase (e.g., `getTransactions.ts`)
- **Routers**: kebab-case with `.router.ts` suffix

### React/Next.js
- Prefer **Server Components** unless interactivity needed
- Use `'use client'` directive explicitly for client components
- Server Actions in dedicated `actions/` directory
- Use TanStack Query for data fetching with tRPC

### API Development
- **tRPC procedures**: Define in appropriate router file
- **Business logic**: Extract to `packages/api/src/services/`
- **Validation**: Use Zod schemas for input validation
- **Context**: Access session via `ctx.session` in protected procedures

## AI Integration

- **Provider**: Google Gemini 2.5 Flash
- **SDK**: Vercel AI SDK (`@ai-sdk/google`, `ai`)
- **Endpoint**: `/ai` (server streaming)
- **Mastra**: AI workflow framework in `apps/web/src/mastra/`

## Additional Libraries

### UI Components
- **shadcn/ui** with Radix UI primitives
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** and **Tabler Icons** for icons
- **Sonner** for toast notifications
- **Vaul** for drawer components

### Forms & Tables
- **TanStack React Form** for form management
- **TanStack React Table** for data tables
- **nuqs** for URL state management

### Utilities
- **class-variance-authority** (cva) for component variants
- **tailwind-merge** (cn utility) for className merging
- **clsx** for conditional classes
- **remeda** for functional utilities
- **superjson** for data serialization

## Environment & Configuration

### Required Environment Variables
- Database connection (in `apps/server/.env`)
- CORS origin configuration
- Better-Auth configuration
- Google AI API keys (for Gemini)

### TypeScript Configuration
- **Base**: `tsconfig.base.json` (shared settings)
- **Root**: `tsconfig.json` (extends base)
- **Package-specific**: Each package has own tsconfig

### Build Tools
- **tsdown**: For package builds
- **Turborepo**: For monorepo task orchestration
- **TailwindCSS**: PostCSS v4

## Best Practices

### When Adding Features
1. **Database changes**: Update Prisma schema, run `npm run db:push`
2. **API changes**: Add/modify tRPC routers in `packages/api/src/routers/`
3. **UI changes**: Create components in `apps/web/src/components/`
4. **Type safety**: Regenerate types if needed (`npm run trpc:generate`)
5. **Build validation**: Run `npm run build` and `npm run check-types`

### When Fixing Bugs
1. Check TypeScript errors first: `npm run check-types`
2. Review tRPC context for auth issues
3. Verify database schema matches Prisma client
4. Check CORS configuration for cross-origin issues
5. Review Next.js console for hydration errors

### When Reviewing Code
- Verify type safety (no `any`, proper Zod validation)
- Check authentication on protected routes
- Ensure proper Server/Client component usage
- Validate database queries use Prisma client
- Confirm monorepo imports use `@finance/*` aliases

## Turborepo Tasks

**Configured tasks** (see `turbo.json`):
- `build` - Outputs to `dist/`, depends on dependencies
- `dev` - Persistent, no cache
- `lint`, `check-types` - Depends on dependencies
- `db:*` - All database tasks are persistent, no cache

## Notes for AI Assistants

- This is a **monorepo**: changes may affect multiple packages
- **Always check package.json** to understand workspace dependencies
- **Database changes require migration**: Don't modify schema without running db commands
- **tRPC is type-safe**: Types flow from server to client automatically
- **Use existing patterns**: Follow established router/service patterns
- **Test locally**: Start dev servers to verify changes work end-to-end
- **Respect Turbo caching**: Some tasks cache, others don't (see turbo.json)
- **npm only**: Don't suggest bun/yarn commands for package management
