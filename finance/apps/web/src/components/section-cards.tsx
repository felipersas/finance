import { MetricCard } from "@/components/metric-card"
import { useSectionCards } from "@/hooks/use-analytics";

export function SectionCards() {
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });

  const { response } = useSectionCards()
  console.log(response)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-3">
      <MetricCard
        description="Faturamento mensal"
        value={response.revenue.total}
        percent={response.revenue.percent}
        footerTrendingText={response.revenue.percent > 0 ? "Em alta este mês" : "Em queda este mês"}
        footerDescription={`Faturamento de ${currentMonth}`}
      />
      <MetricCard
        description="Gastos mensais"
        value={response.expenses.total}
        percent={response.expenses.percent}
        footerTrendingText={response.expenses.percent > 0 ? "Em alta este mês" : "Em queda este mês"}
        footerDescription={`Gastos de ${currentMonth}`}
      />
      <MetricCard
          description="Total líquido mensal"
          value={response.net.total}
          percent={response.net.percent}
          footerTrendingText={response.net.percent > 0 ? "Em alta este mês" : "Em queda este mês"}
          footerDescription={`Total líquido de ${currentMonth}`}
      />
    </div>
  )
}
