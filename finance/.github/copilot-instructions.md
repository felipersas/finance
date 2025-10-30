# GitHub Copilot Instructions – Finance Monorepo

## Project Overview

This repository implements a **Finance** application using the [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) monorepo architecture. It leverages TypeScript throughout, with a Next.js frontend, Elysia backend, tRPC API, and PostgreSQL database managed via Prisma ORM. The project is designed for scalability, maintainability, and rapid feature development, with strict conventions and robust tooling.

---

## Tech Stack & Tooling

- **Language:** TypeScript (ESNext, strict mode, comprehensive type safety)
- **Runtime:** Bun (for backend/server)
- **Frontend:** Next.js 16 (App Router), React 19 (with Compiler)
- **Backend:** Elysia server (modular, fast), tRPC API (type-safe RPC)
- **Database:** PostgreSQL (Dockerized), Prisma ORM
- **Authentication:** Better-Auth (Polar.sh integration)
- **Monorepo Management:** Turborepo (task orchestration, caching), npm workspaces
- **Styling:** TailwindCSS 4, shadcn/ui (Radix primitives)
- **AI Integration:** Google Gemini (via Vercel AI SDK)
- **State Management:** TanStack Query (React Query)
- **Package Manager:** npm 10.9.2 (strictly enforced)
- **Additional Libraries:** Framer Motion, Recharts, Lucide/Tabler Icons, Sonner, Vaul, TanStack React Form/Table, nuqs, cva, tailwind-merge, clsx, remeda, superjson

---

## Monorepo Structure & Responsibilities

```
finance/
├── apps/
│   ├── web/          # Next.js frontend (port 3001)
│   │   └── src/
│   │       ├── app/          # Next.js App Router pages (server/client components)
│   │       ├── components/   # UI components (PascalCase)
│   │       ├── actions/      # Server actions (business logic, mutations)
│   │       ├── hooks/        # Custom React hooks
│   │       ├── lib/          # Client-side utilities
│   │       ├── mastra/       # AI workflow integration (Google Gemini, Mastra)
│   │       └── utils/        # Helper utilities
│   └── server/       # Elysia backend (port 3000)
│       └── src/
│           ├── index.ts      # Server entrypoint, route setup
│           └── auth-guard.ts # Auth middleware (Better-Auth integration)
├── packages/
│   ├── api/          # tRPC API layer & business logic
│   │   └── src/
│   │       ├── index.ts      # tRPC setup
│   │       ├── context.ts    # Context creation (session, db)
│   │       ├── routers/      # Modular tRPC routers (csv, dashboard, products, transactions, users)
│   │       └── services/     # Business logic extraction
│   ├── auth/         # Better-Auth configuration & logic
│   │   └── src/
│   └── db/           # Prisma database layer
│       ├── prisma/
│       │   └── schema/       # Prisma schemas (main, auth)
│       └── src/              # Prisma client exports
└── package.json      # Root package, npm workspaces, scripts
```

---

## Architectural Patterns & Design Principles

### Monorepo & Workspace Management

- **npm workspaces**: All internal packages use `@finance/*` aliases for imports, ensuring modularity and clear dependency boundaries.
- **Turborepo**: Orchestrates builds, dev servers, linting, type-checking, and database tasks. Caching is leveraged for performance; persistent tasks are marked accordingly.
- **Source Exports**: Packages export from `src/` in development, `dist/` in production.

### API Layer (tRPC)

- **Location:** `packages/api/src/routers/`
- **Pattern:** Modular routers, each responsible for a domain (CSV, dashboard, products, transactions, users).
- **Procedures:** Type-safe, Zod-validated, context-aware (session, db).
- **Authentication:** Protected routes via `protectedProcedure` middleware.
- **Business Logic:** Extracted to `services/` for separation of concerns.

### Backend (Elysia Server)

- **Entry:** `apps/server/src/index.ts`
- **Routes:** Modular, including `/api/auth/*` (Better-Auth), `/trpc/*` (tRPC), `/ai` (AI streaming), `/user` (protected).
- **Middleware:** Auth guard for protected endpoints.
- **CORS:** Configured for cross-origin requests.
- **Integration:** tRPC API, Prisma DB, AI endpoint.

### Frontend (Next.js)

- **Framework:** Next.js 16 (App Router), React 19.
- **Components:** Server Components by default; `'use client'` for interactivity.
- **Actions:** Server actions in `src/actions/`.
- **Data Fetching:** TanStack Query with tRPC client.
- **Styling:** TailwindCSS 4, shadcn/ui, Radix primitives.
- **AI Integration:** Mastra workflows, Google Gemini endpoint.

### Database (Prisma)

- **Schemas:** `packages/db/prisma/schema/` (main, auth).
- **Provider:** PostgreSQL (Docker Compose).
- **Client:** Auto-generated, exported from `@finance/db`.
- **Migrations:** Managed via npm scripts.

### Authentication (Better-Auth)

- **Package:** `@finance/auth`
- **Integration:** Polar.sh plugin, context available in tRPC procedures.
- **Middleware:** `protectedProcedure` for route protection.

---

## Module/Package Breakdown & Interdependencies

- **apps/web**: Consumes API via tRPC, manages UI/UX, integrates AI workflows, handles authentication state.
- **apps/server**: Hosts Elysia server, exposes API endpoints, manages authentication, streams AI responses.
- **packages/api**: Centralizes business logic, exposes type-safe API, enforces validation and authentication.
- **packages/auth**: Provides authentication logic, session management, integrates with API and backend.
- **packages/db**: Defines and manages database schema, exposes Prisma client, used by API and backend.

---

## Key Implementation Details & Recurring Patterns

- **TypeScript Strictness:** All code is strictly typed; `any` is avoided, `unknown` preferred for unknowns.
- **Validation:** Zod schemas for all API inputs.
- **File Naming:** PascalCase for components, camelCase for utilities/services, kebab-case for routers.
- **Imports:** Workspace aliases for internal packages, clear separation of server/client code.
- **Testing:** Type checking (`npm run check-types`), build validation, local dev server testing.
- **Database:** Schema changes require migration and Prisma client regeneration.
- **API:** tRPC for type-safe procedures, context for session/auth, Zod for input validation.
- **Frontend:** Server components preferred, TanStack Query for data, explicit client/server boundaries.
- **AI:** Google Gemini via Vercel AI SDK, Mastra workflow integration.

---

## Setup, Configuration, & Environment

### Environment Variables

- **Database connection:** In `apps/server/.env`
- **CORS origin:** For cross-origin requests
- **Better-Auth:** Configuration for authentication
- **Google AI API keys:** For Gemini integration

### TypeScript Configuration

- **Base:** `tsconfig.base.json` (shared settings)
- **Root:** `tsconfig.json` (extends base)
- **Package-specific:** Each package has its own `tsconfig.json`

### Build Tools

- **tsdown:** For package builds
- **Turborepo:** For monorepo orchestration
- **TailwindCSS:** PostCSS v4

---

## Development Workflow

### Package Manager

- **ALWAYS use `npm`** (as specified in package.json: `"packageManager": "npm@10.9.2"`)
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

---

## Integration Points & External Dependencies

- **AI:** Google Gemini (Vercel AI SDK), Mastra workflows
- **Auth:** Better-Auth (Polar.sh)
- **UI:** shadcn/ui, Radix, Framer Motion, Recharts, Lucide/Tabler, Sonner, Vaul
- **Forms/Tables:** TanStack React Form/Table, nuqs
- **Utilities:** cva, tailwind-merge, clsx, remeda, superjson

---

## Best Practices

### When Adding Features

1. **Database changes:** Update Prisma schema, run `npm run db:push`
2. **API changes:** Add/modify tRPC routers in `packages/api/src/routers/`
3. **UI changes:** Create components in `apps/web/src/components/`
4. **Type safety:** Regenerate types if needed (`npm run trpc:generate`)
5. **Build validation:** Run `npm run build` and `npm run check-types`

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

---

## Turborepo Tasks

**Configured tasks** (see `turbo.json`):

- `build` – Outputs to `dist/`, depends on dependencies
- `dev` – Persistent, no cache
- `lint`, `check-types` – Depends on dependencies
- `db:*` – All database tasks are persistent, no cache

---

## Onboarding & Contribution Guide

### Quick Start

1. **Clone the repo** and install dependencies (`npm install`)
2. **Start the database** (`npm run db:start`)
3. **Push the schema** (`npm run db:push`)
4. **Start development servers** (`npm run dev`)
5. **Access the app** at http://localhost:3001 and API at http://localhost:3000

### Contribution Principles

- **Follow workspace and package conventions**
- **Use npm only for package management**
- **Database changes require migration and client regeneration**
- **API changes follow router/service pattern**
- **UI changes in components directory, PascalCase**
- **Type safety and validation are mandatory**
- **Test locally before merging**
- **Respect Turbo caching and task dependencies**

---

## Notes for AI Agents & Human Contributors

- This is a **monorepo**: changes may affect multiple packages
- **Always check package.json** to understand workspace dependencies
- **Database changes require migration**: Don't modify schema without running db commands
- **tRPC is type-safe**: Types flow from server to client automatically
- **Use existing patterns**: Follow established router/service patterns
- **Test locally**: Start dev servers to verify changes work end-to-end
- **Respect Turbo caching**: Some tasks cache, others don't (see turbo.json)
- **npm only**: Don't suggest bun/yarn commands for package management

---

## Advanced Architectural Insights

- **Separation of Concerns:** Each package/module has a clear responsibility, minimizing coupling and maximizing cohesion.
- **Type Safety:** TypeScript strict mode and Zod validation ensure runtime and compile-time safety.
- **Scalability:** Monorepo structure, modular routers/services, and Turborepo orchestration support scaling teams and features.
- **Extensibility:** New domains (routers, services, UI modules) can be added with minimal friction.
- **Security:** Authentication is enforced at API and backend layers; sensitive routes use middleware.
- **Observability:** Logging, error boundaries, and type checks are integrated for maintainability.

---

## File/Directory Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/Services:** camelCase (e.g., `getTransactions.ts`)
- **Routers:** kebab-case with `.router.ts` suffix
- **Schemas:** Lowercase, descriptive (e.g., `auth.prisma`)
- **Actions/Hooks:** camelCase, colocated with usage context

---

## Recurring Patterns

- **Modularization:** Routers, services, components, and utilities are strictly separated.
- **Contextual API:** tRPC context includes session and db, passed to all procedures.
- **Validation:** Zod schemas for all API inputs and outputs.
- **Client/Server Boundaries:** Explicit via Next.js conventions and workspace imports.
- **AI Workflows:** Encapsulated in `mastra/` directory, integrated via dedicated endpoints.

---

## External References

- [Better-T-Stack Documentation](https://github.com/AmanVarshney01/create-better-t-stack)
- [Next.js Documentation](https://nextjs.org/docs)
- [Elysia Documentation](https://elysiajs.com/)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

---

## Contact & Support

For architectural questions, onboarding help, or contribution guidelines, refer to this file first. For deeper technical issues, consult the documentation links above or reach out to the project maintainers.

---