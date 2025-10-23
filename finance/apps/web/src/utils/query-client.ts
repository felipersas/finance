import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
    }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
      },
    },
  });
}
