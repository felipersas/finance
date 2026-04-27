# Finance

Plataforma completa de gestão financeira pessoal com inteligência artificial. Permite importar extratos bancários via CSV, categorizar transações automaticamente, visualizar analytics e interagir com um chatbot financeiro via SSE streaming.

## Visão Geral da Arquitetura

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
│       ├── auth/     # Pacote compartilhado de autenticação (better-auth)
│       └── api/      # Cliente tRPC compartilhado
├── docs/             # Documentação de deploy e infraestrutura
├── scripts/          # Scripts de setup e automação
└── docker-compose*.yml
```

## Tech Stack

### Backend (mcp-api)
| Tecnologia | Uso |
|---|---|
| **NestJS** | Framework HTTP principal |
| **Prisma ORM** | Mapeamento objeto-relacional e migrations |
| **PostgreSQL** | Banco de dados relacional |
| **JWT** | Autenticação stateless |
| **SSE** | Streaming de respostas do chatbot |
| **Docker** | Containerização |

### Mobile (startapp)
| Tecnologia | Uso |
|---|---|
| **Expo SDK 52** | Framework mobile multiplataforma |
| **React Native** | UI nativa iOS/Android |
| **Expo Router** | Navegação file-based |
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
| **Tailwind CSS** | Estilização |
| **better-auth** | Autenticação |

### Infraestrutura
| Tecnologia | Uso |
|---|---|
| **Docker Compose** | Orquestração de containers (dev + prod) |
| **Docker Swarm** | Orquestração de produção |
| **Traefik** | Reverse proxy e SSL automático |
| **GitHub Actions** | CI/CD |

## Módulos da API (mcp-api)

O backend segue **Arquitetura Hexagonal** (Ports & Adapters), separando domínio de infraestrutura:

| Módulo | Descrição |
|---|---|
| **auth** | Autenticação JWT (login, registro, refresh token) |
| **user** | Gerenciamento de usuários |
| **csv** | Upload e parse de extratos bancários CSV |
| **extracts** | Gestão de extratos bancários importados |
| **analytics** | Relatórios e dashboard financeiro |
| **chatbot** | Chatbot financeiro com IA (SSE streaming) |
| **notification** | Notificações push |

### Estrutura Hexagonal (por módulo)

```
module/
├── domain/          # Entidades, interfaces de porta (business logic pura)
├── application/     # Casos de uso, serviços de aplicação
├── infrastructure/  # Adaptadores: repositórios Prisma, controllers HTTP
└── module.ts        # Definição do módulo NestJS
```

### Camada Common Compartilhada

```
common/
├── decorators/      # Decorators customizados
├── dtos/            # Data Transfer Objects
├── errors/          # Classes de erro
├── exceptions/      # Filtros de exceção
├── interceptors/    # Interceptadores de requisição
├── services/        # Serviços compartilhados
├── types/           # Tipos TypeScript
└── utils/           # Funções utilitárias
```

## Schema do Banco de Dados (Prisma)

O ORM Prisma gerencia as migrations e o acesso ao PostgreSQL. Principais entidades:

- **User** - Usuários da plataforma
- **Extract** - Extratos bancários importados
- **Transaction** - Transações financeiras
- **Category** - Categorias de transação

Migrations versionadas em `mcp-api/prisma/migrations/`.

Otimização de índices disponível em `optimize-indexes.sql`.

## App Mobile (startapp)

### Telas

| Rota | Descrição |
|---|---|
| `/splash` | Tela de abertura |
| `/sign-in` | Login |
| `/sign-up` | Registro |
| `/(private)/(tabs)/` | Área autenticada (tab navigation) |
| `/(private)/(tabs)/index` | Dashboard principal |
| `/(private)/(tabs)/transacoes` | Lista de transações |
| `/(private)/(tabs)/alertas-lembretes` | Alertas e lembretes financeiros |

### Componentes

| Diretório | Descrição |
|---|---|
| `auth/` | Componentes de autenticação |
| `chat/` | Interface do chatbot |
| `transactions/` | Cards e listas de transações |
| `notifications/` | Componentes de notificação |
| `form/` | Inputs e formulários |
| `layout/` | Layout e navegação |
| `ui/` | Componentes base (shadcn-inspired) |
| `common/` | Componentes compartilhados |

### Hooks

| Hook | Descrição |
|---|---|
| `useAnalytics` | Dados de dashboard/analytics |
| `useChatApi` | Integração com chatbot (SSE) |
| `useUploadCsv` | Upload de extratos CSV |
| `useListExtract` | Listagem de extratos importados |
| `useNotifications` | Gerenciamento de notificações |
| `useStorageState` | Estado persistido localmente |
| `mutations/` | Mutations React Query |

### Providers

- **SessionProvider** - Gerenciamento de sessão autenticada
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

Sobe PostgreSQL + API + dependências.

### Docker Compose (Produção)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Deploy em Docker Swarm com Traefik como reverse proxy com SSL automático.

### CI/CD

Pipeline configurado via GitHub Actions (`.github/workflows/`).

### Scripts

| Script | Descrição |
|---|---|
| `deploy.sh` | Script de deploy automatizado |
| `scripts/setup-vps.sh` | Provisionamento completo de VPS |
| `optimize-indexes.sql` | Otimização de índices PostgreSQL |

### Documentação de Infraestrutura

| Documento | Descrição |
|---|---|
| `docs/QUICK_START_DEPLOY.md` | Guia rápido de deploy |
| `docs/DEPLOY-SWARM-GUIDE.md` | Deploy com Docker Swarm |
| `docs/TRAEFIK_CONFIG.md` | Configuração do Traefik |
| `docs/CICD_SETUP.md` | Configuração de CI/CD |
| `DEPLOY_OPTIMIZATION.md` | Otimizações de deploy |

## Primeiros Passos

### Requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (ou usar via Docker)
- Expo CLI (para mobile)

### Configuração

```bash
# Clone o repositório
git clone https://github.com/felipersas/finance.git
cd finance

# Copie as variáveis de ambiente
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

## Licença

Projeto privado. Todos os direitos reservados.
