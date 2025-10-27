import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertCircle } from "lucide-react";
import { useDasDueDays } from "@/hooks/use-analytics";
import Link from "next/link";
import { CardGradient } from "@/components/ui/card-gradient";
import { toDayWithoutHour } from "@/utils/formatters/format-date-br";

export function DasDueDaysCard() {
  const { dasDue } = useDasDueDays();

  const status = dasDue.daysLeft < 0 ? "expired" : "ok";

  return (
    <CardGradient
      className="@container/card min-h-[320px]"
      opacity={0.2}
      data-slot="card"
    >
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          DAS - Imposto MEI
        </CardTitle>
        <CardDescription>
          Vencimento todo dia 20. Fique atento ao prazo!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "ok" ? (
          <div className="flex flex-col gap-4 items-center justify-center py-8 h-full min-h-[320px]">
            <div className="flex flex-col items-center justify-center">
              <div className="text-7xl font-bold tabular-nums text-center">
                {dasDue.daysLeft}
              </div>
              <div className="text-2xl font-semibold text-center">
                {dasDue.daysLeft === 1 ? "dia" : "dias"}
              </div>
            </div>
            <div className="text-xl text-muted-foreground text-center">
              para o vencimento ({toDayWithoutHour(dasDue.dueDate)})
            </div>
            <Link
              href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex justify-center"
              aria-label="Ir para página de pagamento do DAS"
            >
              <Button size="lg" className="font-semibold" asChild>
                <span>Pagar DAS</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center py-8 h-full min-h-[320px]">
            <div className="flex items-center gap-2 text-destructive font-semibold text-center">
              <AlertCircle className="w-5 h-5" />
              Vencido!
            </div>
            <div className="text-lg text-muted-foreground text-center">
              O DAS venceu em {toDayWithoutHour(dasDue.dueDate)}.
            </div>
            <div className="text-base text-warning text-center font-semibold">
              Você pode pagar mesmo após o vencimento, mas haverá cobrança de
              juros e multa.
            </div>
            <Link
              href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex justify-center"
              aria-label="Ir para página de pagamento do DAS"
            >
              <Button size="lg" className="font-semibold" asChild>
                <span>Pagar DAS</span>
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </CardGradient>
  );
}
