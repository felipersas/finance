import Dashboard from "./dashboard";
import { HydrateClient, prefetch, trpc } from '@/utils/trpc-server';

export default async function Page(){

  prefetch(trpc.dashboard.sectionCards.queryOptions());
  prefetch(trpc.dashboard.areaChartData.queryOptions({ range: "30d" }));

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  )
}
