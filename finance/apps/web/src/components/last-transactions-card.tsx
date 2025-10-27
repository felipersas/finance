import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoneyView } from "@/utils/formatters/format-money-brl";
import { Calendar } from "lucide-react";
import { useLastTransactions } from "@/hooks/use-analytics";

function FormattedDate({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  return (
    <>
      {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
    </>
  );
}

type Transaction = {
  id: string | number;
  descricao?: string;
  data: string;
  tipoOperacao?: string;
  valor: number | string;
};

export function LastTransactionsCard() {
  const { transactions } = useLastTransactions();
  const txs: Transaction[] = Array.isArray(transactions) ? transactions : [];

  return (
    <Card
      className="@container/card col-span-1 @xl/main:col-span-2 @5xl/main:col-span-2 relative overflow-hidden"
      data-slot="card"
    >
      {/* Gradient background layer usando variáveis do tema */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          background: `
            linear-gradient(
              135deg,
              var(--color-primary) 0%,
              var(--color-accent) 60%,
              var(--color-muted) 100%
            )
          `,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg">Últimas transações do mês</CardTitle>
          <CardDescription>
            Veja as 5 movimentações mais recentes deste mês.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-4">
            {txs.length === 0 ? (
              <li className="text-muted-foreground text-sm py-4">
                Nenhuma transação encontrada para este mês.
              </li>
            ) : (
              txs.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3">
                  <span className="rounded-full bg-accent p-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {tx.descricao || (
                        <span className="text-muted-foreground">
                          Sem descrição
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <FormattedDate dateStr={tx.data} />
                      {tx.tipoOperacao && (
                        <Badge variant="outline" className="ml-2">
                          {tx.tipoOperacao}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div
                    className={`font-semibold text-right ${Number(tx.valor) < 0 ? "text-destructive" : "text-success"}`}
                  >
                    {formatMoneyView(String(tx.valor))}
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </div>
    </Card>
  );
}
