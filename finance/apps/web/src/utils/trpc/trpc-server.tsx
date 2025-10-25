import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import type { AppRouter } from "@finance/api/routers/index";
import { makeQueryClient } from "../query-client";
import { headers } from "next/headers";

// IMPORTANT: Create a stable getter for the query client that
// will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

function getUrl() {
  const base = (() => {
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  })();
  return `${base}/trpc`;
}

// Create tRPC client for server-side requests
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: getUrl(),
        async headers() {
          const headersList = await headers();
          // Forward cookies for session authentication
          return {
            cookie: headersList.get("cookie") ?? "",
          };
        },
      }),
      false: httpBatchLink({
        url: getUrl(),
        async headers() {
          const headersList = await headers();
          // Forward cookies for session authentication
          return {
            cookie: headersList.get("cookie") ?? "",
          };
        },
      }),
    }),
  ],
});

// Create the tRPC proxy for server components
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient: getQueryClient,
});

// Helper component to wrap your content with hydration boundary
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

// Helper function for prefetching queries in server components
export function prefetch(queryOptions: any) {
  const queryClient = getQueryClient();

  // Check if it's an infinite query or regular query
  if (queryOptions.queryKey?.[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
