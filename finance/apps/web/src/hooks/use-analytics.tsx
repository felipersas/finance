'use client';

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc-client";

export const useTotalRevenue = () => {
  const trpc = useTRPC();
  const { data: response } = useSuspenseQuery(
    trpc.analytics.totalRevenue.queryOptions()
  );

  // Com useSuspenseQuery, data sempre existe (nunca undefined)
  return {
    response
  }
}
