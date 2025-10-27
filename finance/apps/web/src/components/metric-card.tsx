import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoneyView } from "@/utils/formatters/format-money-brl";
import { CardGradient } from "@/components/ui/card-gradient";

interface MetricCardProps {
  description: string;
  value: number;
  percent: number;
  footerTrendingText: string;
  footerDescription: string;
}

export function MetricCard({
  description,
  value,
  percent,
  footerTrendingText,
  footerDescription,
}: MetricCardProps) {
  const isPositive = percent > 0;
  const Icon = isPositive ? IconTrendingUp : IconTrendingDown;

  return (
    <CardGradient className="@container/card" opacity={0.2} data-slot="card">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {formatMoneyView(String(value) ?? "0.00")}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <Icon />
            {Math.abs(percent).toFixed(1)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footerTrendingText} <Icon className="size-4" />
        </div>
        <div className="text-muted-foreground">{footerDescription}</div>
      </CardFooter>
    </CardGradient>
  );
}
