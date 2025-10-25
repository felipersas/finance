import { TransactionsTable } from "@/components/transactions-table";

export default function Page() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Transações</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie suas transações financeiras.
        </p>
      </div>
      <TransactionsTable />
    </div>
  );
}
