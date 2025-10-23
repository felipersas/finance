# tRPC Server-Side Prefetching Guide

Este guia explica como usar o prefetching do lado do servidor com tRPC e React Server Components no projeto.

## 📁 Arquivos Criados

- **`src/utils/trpc-client.tsx`** - Utilities para Client Components
- **`src/utils/trpc-server.tsx`** - Utilities para Server Components (prefetch)
- **`src/app/example-prefetch-page.tsx`** - Exemplo de página com prefetching
- **`src/app/client-component.tsx`** - Exemplos de componentes cliente

## 🚀 Como Usar

### 1. Em Server Components (Páginas/Layouts)

```tsx
import { HydrateClient, prefetch, trpc } from '@/utils/trpc-server';
import { MyClientComponent } from './my-client-component';

export default async function MyPage() {
  // Inicia o prefetch (streaming - recomendado)
  prefetch(
    trpc.users.getById.queryOptions({
      id: '123',
    })
  );

  return (
    <HydrateClient>
      <h1>Minha Página</h1>
      <MyClientComponent />
    </HydrateClient>
  );
}
```

### 2. Em Client Components

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc-client';

export function MyClientComponent() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.users.getById.queryOptions({
      id: '123',
    })
  );

  if (isLoading) return <div>Carregando...</div>;

  return <div>{data?.name}</div>;
}
```

## 🎯 Duas Abordagens de Prefetching

### Abordagem 1: Streaming (Recomendado) ⚡

**Vantagem**: Melhor performance, página carrega mais rápido  
**Desvantagem**: Pode mostrar loading state no cliente inicialmente

```tsx
export default async function MyPage() {
  // void = não espera, inicia fetch e continua
  prefetch(trpc.users.list.queryOptions());

  return (
    <HydrateClient>
      <UsersList /> {/* pode mostrar loading inicialmente */}
    </HydrateClient>
  );
}
```

**Como funciona:**
1. Servidor inicia a requisição
2. HTML é enviado imediatamente ao cliente
3. Dados fazem streaming quando ficam prontos
4. Cliente recebe e hidrata automaticamente

### Abordagem 2: Await (Sem Loading State) 🐢

**Vantagem**: Cliente sempre tem dados na primeira renderização  
**Desvantagem**: Página demora mais para carregar (espera dados no servidor)

```tsx
import { getQueryClient, trpc } from '@/utils/trpc-server';

export default async function MyPage() {
  const queryClient = getQueryClient();

  // await = espera completar antes de enviar HTML
  await queryClient.prefetchQuery(
    trpc.users.list.queryOptions()
  );

  return (
    <HydrateClient>
      <UsersList /> {/* sempre tem dados */}
    </HydrateClient>
  );
}
```

## 🔄 Com Suspense e Error Boundaries

Para melhor UX, use Suspense e Error Boundaries:

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default async function MyPage() {
  prefetch(trpc.users.list.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Erro ao carregar</div>}>
        <Suspense fallback={<div>Carregando...</div>}>
          <UsersListWithSuspense />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
```

No componente cliente, use `useSuspenseQuery`:

```tsx
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc-client';

export function UsersListWithSuspense() {
  const trpc = useTRPC();

  // Com useSuspenseQuery, data sempre existe (nunca undefined)
  const { data } = useSuspenseQuery(
    trpc.users.list.queryOptions()
  );

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 📊 Múltiplas Queries

Você pode fazer prefetch de múltiplas queries em paralelo:

```tsx
export default async function Dashboard() {
  // Todas iniciam em paralelo
  prefetch(trpc.users.list.queryOptions());
  prefetch(trpc.transactions.recent.queryOptions({ limit: 10 }));
  prefetch(trpc.stats.summary.queryOptions());

  return (
    <HydrateClient>
      <UsersList />
      <RecentTransactions />
      <StatsSummary />
    </HydrateClient>
  );
}
```

## 🎨 Usando Dados no Servidor

Se você **realmente precisa** dos dados no servidor (não apenas prefetch):

```tsx
import { getQueryClient, trpc, HydrateClient } from '@/utils/trpc-server';

export default async function MyPage() {
  const queryClient = getQueryClient();

  // fetchQuery retorna os dados E faz prefetch
  const users = await queryClient.fetchQuery(
    trpc.users.list.queryOptions()
  );

  return (
    <HydrateClient>
      <h1>Total de usuários: {users.length}</h1>
      <UsersList /> {/* também tem acesso aos dados */}
    </HydrateClient>
  );
}
```

⚠️ **Atenção**: Use isso apenas quando necessário! Na maioria dos casos, prefetch é suficiente.

## 🔧 Helpers Disponíveis

### `prefetch(queryOptions)`
Inicia prefetch sem bloquear (streaming).

### `HydrateClient`
Componente que envolve seus children e passa os dados prefetched ao cliente.

### `getQueryClient()`
Retorna o query client para casos avançados.

### `trpc`
Proxy do tRPC para criar queryOptions.

### `useTRPC()` (client only)
Hook para acessar o tRPC no cliente.

## 📝 Exemplos Práticos

### Página de Detalhes de Usuário

```tsx
// app/users/[id]/page.tsx
import { HydrateClient, prefetch, trpc } from '@/utils/trpc-server';
import { UserDetails } from './user-details';

export default async function UserPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Prefetch user data e suas transações
  prefetch(trpc.users.getById.queryOptions({ id: params.id }));
  prefetch(trpc.transactions.byUser.queryOptions({ userId: params.id }));

  return (
    <HydrateClient>
      <UserDetails userId={params.id} />
    </HydrateClient>
  );
}
```

```tsx
// app/users/[id]/user-details.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/utils/trpc-client';

export function UserDetails({ userId }: { userId: string }) {
  const trpc = useTRPC();

  const user = useQuery(trpc.users.getById.queryOptions({ id: userId }));
  const transactions = useQuery(
    trpc.transactions.byUser.queryOptions({ userId })
  );

  if (user.isLoading || transactions.isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>{user.data?.name}</h1>
      <h2>Transações</h2>
      <ul>
        {transactions.data?.map(tx => (
          <li key={tx.id}>{tx.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🚨 Troubleshooting

### "Cannot find module 'server-only'"
```bash
npm install server-only client-only
```

### Dados não aparecem no cliente
- Verifique se você envolveu com `<HydrateClient>`
- Confirme que os `queryOptions` são idênticos no server e client
- Cheque se o `queryKey` está correto

### TypeScript errors
- Certifique-se que `@finance/api` está exportando o tipo `AppRouter`
- Verifique os imports em `trpc-client.tsx` e `trpc-server.tsx`

### Cookies/Auth não funcionam
- Verifique se `credentials: 'include'` está configurado
- Confirme que as variáveis de ambiente estão corretas
- No servidor, pode precisar passar headers manualmente

## 📚 Recursos

- [Documentação oficial tRPC](https://trpc.io/docs/client/tanstack-react-query/server-components)
- [React Query SSR Guide](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## 🎯 Boas Práticas

1. ✅ Use `prefetch()` por padrão (streaming)
2. ✅ Use `await prefetch` apenas quando necessário
3. ✅ Prefetch múltiplas queries em paralelo
4. ✅ Use Suspense para melhor UX
5. ❌ Não use `fetchQuery` a menos que precise dos dados no servidor
6. ❌ Não faça prefetch de mutations
7. ❌ Não duplique lógica entre server e client