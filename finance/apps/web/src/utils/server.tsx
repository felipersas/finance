import 'server-only';
import { createTRPCClient, httpBatchLink, httpLink, isNonJsonSerializable, splitLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { makeQueryClient } from './query-client';
import type { AppRouter } from '@finance/api/routers/index';
import { headers } from 'next/headers';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
const getQueryClient = cache(makeQueryClient);

const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`;

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url,
        async headers() {
          const headersList = await headers();
          // Forward cookies for session authentication
          return {
            cookie: headersList.get('cookie') ?? '',
          };
        },
      }),
      false: httpBatchLink({
        url,
        async headers() {
          const headersList = await headers();
          // Forward cookies for session authentication
          return {
            cookie: headersList.get('cookie') ?? '',
          };
        },
      }),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient: getQueryClient,
});

// Export getQueryClient for prefetching in Server Components
export { getQueryClient };
