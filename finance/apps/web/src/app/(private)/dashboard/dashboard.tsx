"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ClientOnly } from "@/components/ClientOnly";
import { SectionCards } from "@/components/section-cards";
import { ErrorBoundary } from "@/components/error-boundary";
import { LastTransactionsCard } from "@/components/last-transactions-card";
import { DasDueDaysCard } from "@/components/dashboard/das-due-days-card";

export default function Dashboard() {
  return (
    <>
      <ErrorBoundary>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch px-4 lg:px-6">
                <LastTransactionsCard />
                <DasDueDaysCard />
              </div>
              <div className="px-4 lg:px-6">
                <ClientOnly>
                  <ChartAreaInteractive />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}
