# Finance

Plataforma completa de gestao financeira pessoal com inteligencia artificial. Permite importar extratos bancarios via CSV, categorizar transacoes automaticamente, visualizar analytics e interagir com um chatbot financeiro via SSE streaming.

## Visao Geral da Arquitetura

```
finance/
├── mcp-api/          # API REST (NestJS) - Backend principal
├── startapp/         # App Mobile (Expo / React Native)
├── finance/          # Monorepo Web (Turborepo / Next.js)
│   ├── apps/
│   │   ├── web/      # Frontend Web (Next.js + tRPC + shadcn/ui)
│   │   └── server/   # Server-side app
│   └── packages/
│       ├── db/       # Pacote compartilhado Prisma ORM
│       ├── auth/     # Pacote compartilhado de autenticacao (better-auth)
│       └── api/      # Cliente tRPC compartilhado
├── docs/             # Documentacao de deploy e infraestrutura
├── scripts/          # Scripts de setup e automacao
└── docker-compose*.yml
```

## Tech Stack

### Backend (mcp-api)
| Tecnologia | Uso |
|---|---|
| **NestJS** | Framework HTTP principal |
| **Prisma ORM** | Mapeamento objeto-relacional e migrations |
| **PostgreSQL** | Banco de dados relacional |
| **JWT** | Autenticacao stateless |
| **SSE** | Streaming de respostas do chatbot |
| **Docker** | Containerizacao |

### Mobile (startapp)
| Tecnologia | Uso |
|---|---|
| **Expo SDK 52** | Framework mobile multiplataforma |
| **React Native** | UI nativa iOS/Android |
| **Expo Router** | Navegacao file-based |
| **NativeWind v4** | Tailwind CSS para React Native |
| **React Query** | Gerenciamento de estado servidor |
| **EAS Build** | Build e deploy na nuvem |

### Web (finance/)
| Tecnologia | Uso |
|---|---|
| **Next.js 15** | Framework React full-stack |
| **Turborepo** | Build system monorepo |
| **Bun** | Runtime e gerenciador de pacotes |
| **tRPC** | API type-safe cliente/servidor |
| **shadcn/ui** | Componentes UI |
| **Tailwind CSS** | Estilizacao |
| **better-auth** | Autenticacao |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| **Docker Compose** | Orquestracao de containers (dev + prod) |
| **Docker Swarm** | Orquestracao de producao |
| **Traefik** | Reverse proxy e SSL automatico |
| **GitHub Actions** | CI/CD |

## Modulos da API (mcp-api)

O backend segue **Arquitetura Hexagonal** (Ports & Adapters), separando dominio de infraestrutura:

| Modulo | Descricao |
|---|---|
| **auth** | Autenticacao JWT (login, registro, refresh token) |
| **user** | Gerenciamento de usuarios |
| **csv** | Upload e parse de extratos bancarios CSV |
| **extracts** | Gestao de extratos bancarios importados |
| **analytics** | Relatorios e dashboard financeiro |
| **chatbot** | Chatbot financeiro com IA (SSE streaming) |
| **notification** | Notificacoes push |

### Estrutura Hexagonal (por modulo)

```
module/
├── domain/          # Entidades, interfaces de porta (business logic pura)
├── application/     # Casos de uso, servicos de aplicacao
├── infrastructure/  # Adaptadores: repositorios Prisma, controllers HTTP
└── module.ts        # Definicao do modulo NestJS
```

### Camada Common Compartilhada

```
common/
├── decorators/      # Decorators customizados
├── dtos/            # Data Transfer Objects
├── errors/          # Classes de erro
├── exceptions/      # Filtros de excecao
├── interceptors/    # Interceptadores de requisicao
├── services/        # Servicos compartilhados
├── types/           # Tipos TypeScript
└── utils/           # Funcoes utilitarias
```

## Schema do Banco de Dados (Prisma)

O ORM Prisma gerencia as migrations e o acesso ao PostgreSQL. Principais entidades:

- **User** - Usuarios da plataforma
- **Extract** - Extratos bancarios importados
- **Transaction** - Transacoes financeiras
- **Category** - Categorias de transacao

Migrations versionadas em `mcp-api/prisma/migrations/`.

Otimizacao de indices disponivel em `optimize-indexes.sql`.

## App Mobile (startapp)

### Telas

| Rota | Descricao |
|---|---|
| `/splash` | Tela de abertura |
| `/sign-in` | Login |
| `/sign-up` | Registro |
| `/(private)/(tabs)/` | Area autenticada (tab navigation) |
| `/(private)/(tabs)/index` | Dashboard principal |
| `/(private)/(tabs)/transacoes` | Lista de transacoes |
| `/(private)/(tabs)/alertas-lembretes` | Alertas e lembretes financeiros |

### Componentes

| Diretorio | Descricao |
|---|---|
| `auth/` | Componentes de autenticacao |
| `chat/` | Interface do chatbot |
| `transactions/` | Cards e listas de transacoes |
| `notifications/` | Componentes de notificacao |
| `form/` | Inputs e formularios |
| `layout/` | Layout e navegacao |
| `ui/` | Componentes base (shadcn-inspired) |
| `common/` | Componentes compartilhados |

### Hooks

| Hook | Descricao |
|---|---|
| `useAnalytics` | Dados de dashboard/analytics |
| `useChatApi` | Integracao com chatbot (SSE) |
| `useUploadCsv` | Upload de extratos CSV |
| `useListExtract` | Listagem de extratos importados |
| `useNotifications` | Gerenciamento de notificacoes |
| `useStorageState` | Estado persistido localmente |
| `mutations/` | Mutations React Query |

### Providers

- **SessionProvider** - Gerenciamento de sessao autenticada
- **QueryProvider** - React Query (TanStack Query) para cache e estado servidor

## Monorepo Web (finance/)

Estrutura Turborepo com apps e packages compartilhados:

- **apps/web** - Next.js 15 com App Router, tRPC, shadcn/ui, Tailwind CSS, Mastra AI
- **apps/server** - Server build com tsdown
- **packages/db** - Schema Prisma compartilhado com Docker Compose para PostgreSQL local
- **packages/auth** - better-auth compartilhado
- **packages/api** - Cliente tRPC type-safe

## Infraestrutura e Deploy

### Docker Compose (Desenvolvimento)

```bash
docker-compose up -d
```

Sobe PostgreSQL + API + dependencias.

### Docker Compose (Producao)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Deploy em Docker Swarm com Traefik como reverse proxy com SSL automatico.

### CI/CD

Pipeline configurado via GitHub Actions (`.github/workflows/`).

### Scripts

| Script | Descricao |
|---|---|
| `deploy.sh` | Script de deploy automatizado |
| `scripts/setup-vps.sh` | Provisionamento completo de VPS |
| `optimize-indexes.sql` | Otimizacao de indices PostgreSQL |

### Documentacao de Infraestrutura

| Documento | Descricao |
|---|---|
| `docs/QUICK_START_DEPLOY.md` | Guia rapido de deploy |
| `docs/DEPLOY-SWARM-GUIDE.md` | Deploy com Docker Swarm |
| `docs/TRAEFIK_CONFIG.md` | Configuracao do Traefik |
| `docs/CICD_SETUP.md` | Configuracao de CI/CD |
| `DEPLOY_OPTIMIZATION.md` | Otimizacoes de deploy |

## Primeiros Passos

### Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (ou usar via Docker)
- Expo CLI (para mobile)

### Configuracao

```bash
# Clone o repositorio
git clone https://github.com/felipersas/finance.git
cd finance

# Copie as variaveis de ambiente
cp .env.example .env

# Suba o banco de dados
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

## Licenca

Projeto privado. Todos os direitos reservados.
