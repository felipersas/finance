'use client';

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc-client";

export const useSectionCards = () => {
  const trpc = useTRPC();
  const { data: response } = useSuspenseQuery(
    trpc.dashboard.sectionCards.queryOptions()
  );

  // Com useSuspenseQuery, data sempre existe (nunca undefined)
  return {
    response
  }
}
