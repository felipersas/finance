import Dashboard from "./dashboard";
import { HydrateClient, prefetch, trpc } from '@/utils/trpc-server';

export default async function Page(){

  // Prefetch - não precisa passar queryKey, o tRPC gera automaticamente
  prefetch(trpc.analytics.totalRevenue.queryOptions());

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  )
}
