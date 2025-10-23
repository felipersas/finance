"use client"



import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useAreaChartData } from "@/hooks/use-area-chart-data"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatMoneyView } from "@/utils/formatters/format-money-brl"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

/**
 * Os dados do gráfico agora vêm do backend via hook useAreaChartData.
 * Estrutura esperada: { date, entrada, saida }
 */

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // O filtro de período agora envia o range correto para o hook
  const { data: areaChartData, isLoading } = useAreaChartData(timeRange as "7d" | "30d" | "90d");

  console.log(areaChartData)

  // Os dados já vêm filtrados do backend conforme o período selecionado
  const filteredData = (areaChartData ?? []).map((item) => ({
    date: item.date,
    entrada: item.entrada,
    saida: item.saida,
  }));

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Visitors</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <span className="text-muted-foreground text-lg">Carregando gráfico...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Movimentações</CardTitle>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 dias</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-saida)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-saida)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                // Evita hydration mismatch: formato fixo no SSR
                return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth()+1).toString().padStart(2, "0")}`;
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                // Custom tooltip content
                ({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const entrada = payload.find(p => p.dataKey === "entrada")?.value ?? 0;
                  const saida = payload.find(p => p.dataKey === "saida")?.value ?? 0;
                  return (
                    <div
                      className="rounded-xl bg-popover p-4 shadow-lg"
                      style={{ minWidth: 180, maxWidth: 240 }}
                    >
                      <div className="font-semibold mb-2">
                        {typeof window !== "undefined"
                          ? new Date(label).toLocaleDateString("pt-BR", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : new Date(label).toISOString().slice(0, 10)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>
                          <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ background: "var(--color-mobile)" }} />
                          <span className="font-medium">Entradas:</span>{" "}
                          <span className="font-mono">{formatMoneyView(String(entrada))}</span>
                        </span>
                        <span>
                          <span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ background: "var(--color-saida)" }} />
                          <span className="font-medium">Saídas:</span>{" "}
                          <span className="font-mono">{formatMoneyView(String(saida))}</span>
                        </span>
                      </div>
                    </div>
                  );
                }
              }
            />
            <Area
              dataKey="entrada"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="saida"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-saida)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
