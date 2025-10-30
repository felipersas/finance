import Dashboard from "./dashboard";
import { HydrateClient, prefetch, trpc } from "@/utils/trpc/trpc-server";

export default async function Page() {
  prefetch(trpc.dashboard.sectionCards.queryOptions());
  prefetch(trpc.dashboard.areaChartData.queryOptions({ range: "30d" }));
  prefetch(trpc.dashboard.lastTransactions.queryOptions());
  prefetch(trpc.dashboard.dasDueDays.queryOptions());
  prefetch(trpc.dashboard.lastDasPayments.queryOptions());

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  );
}
