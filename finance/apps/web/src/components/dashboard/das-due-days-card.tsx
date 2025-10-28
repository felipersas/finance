import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, AlertCircle } from "lucide-react";
import { useDasDueDays, useMarkDasAsPaid } from "@/hooks/use-analytics";
import Link from "next/link";
import { CardGradient } from "@/components/ui/card-gradient";
import { toDayWithoutHour } from "@/utils/formatters/format-date-br";
import { useState } from "react";
import { toast } from "sonner";

export function DasDueDaysCard() {
  const { dasDue } = useDasDueDays();
  const { mutate, isPending } = useMarkDasAsPaid();
  const [justPaid, setJustPaid] = useState(false);

  const paymentStatus = dasDue?.paymentStatus;
  const isPaid = paymentStatus?.paid || justPaid;

  const status = dasDue.daysLeft < 0 ? "expired" : "ok";

  const handleMarkPaid = () => {
    const currentMonth = dasDue?.month;
    if (!currentMonth) return;
    mutate(
      { month: currentMonth },
      {
        onSuccess: () => {
          setJustPaid(true);
          toast.success("DAS marcado como pago!");
        },
        onError: () => {
          toast.error("Erro ao marcar DAS como pago.");
        },
      },
    );
  };

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
            <div className="mt-4 w-full flex justify-center gap-2">
              {isPaid ? (
                <Link
                  href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ir para página de pagamento do DAS"
                  className=""
                >
                  <Button size="lg" className="font-semibold" asChild>
                    <span>Pagar DAS</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ir para página de pagamento do DAS"
                    className=""
                  >
                    <Button size="lg" className="font-semibold" asChild>
                      <span>Pagar DAS</span>
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    className="font-semibold"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleMarkPaid}
                    aria-label="Marcar DAS como pago"
                  >
                    Já paguei <span className="ml-1">👍</span>
                  </Button>
                </>
              )}
            </div>
            {isPaid && (
              <div className="text-green-600 text-base font-semibold mt-2 flex items-center gap-2">
                <span>DAS deste mês já foi marcado como pago!</span>
                <span>👍</span>
              </div>
            )}
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
            <div className="mt-4 w-full flex justify-center gap-2">
              {isPaid ? (
                <Link
                  href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ir para página de pagamento do DAS"
                  className=""
                >
                  <Button size="lg" className="font-semibold" asChild>
                    <span>Pagar DAS</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ir para página de pagamento do DAS"
                    className=""
                  >
                    <Button size="lg" className="font-semibold" asChild>
                      <span>Pagar DAS</span>
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    className="font-semibold"
                    variant="outline"
                    disabled={isPending}
                    onClick={handleMarkPaid}
                    aria-label="Marcar DAS como pago"
                  >
                    Já paguei <span className="ml-1">🟩</span>
                  </Button>
                </>
              )}
            </div>
            {isPaid && (
              <div className="text-green-600 text-base font-semibold mt-2 flex items-center gap-2">
                <span>DAS deste mês já foi marcado como pago!</span>
                <span>🟩</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </CardGradient>
  );
}
