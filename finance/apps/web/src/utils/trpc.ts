import { createTRPCClient, httpBatchLink, httpLink, isNonJsonSerializable, splitLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@finance/api/routers/index";
import { makeQueryClient } from "./query-client";

const url =`${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`


const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url,
        fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				})
        },
      }),
      false: httpBatchLink({
        url,
        fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
      }),
    }),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient: makeQueryClient(),
});
