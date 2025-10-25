"use client";

import * as React from "react";
import type {
  CellContext,
  ColumnDef,
  HeaderContext,
  SortingState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
} from "lucide-react";

import { useTransactions } from "@/hooks/use-transactions";
import { useDebounce } from "@/hooks/use-debounce";
import { useUploadCsvMutation } from "@/hooks/useUploadCsv";
import { formatMoneyView } from "@/utils/formatters/format-money-brl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface Transaction {
  id: string;
  userId?: string;
  data: string;
  valor: number | string;
  identificador: string;
  descricao?: string;
  tipoOperacao?: string;
  remetenteDestinatario?: string;
  documento?: string;
  instituicaoFinanceira?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  tipo?: string;
  createdAt: string;
}

const ROW_HEIGHT = "h-12";
const TABLE_ROWS = 10;

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "data",
    header: ({ column }: HeaderContext<Transaction, any>) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }: CellContext<Transaction, any>) => {
      const date = new Date(row.getValue("data") as string);
      return <div>{date.toLocaleDateString("pt-BR")}</div>;
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }: CellContext<Transaction, any>) => (
      <div className="max-w-[200px] truncate">
        {(row.getValue("descricao") as string) || "-"}
      </div>
    ),
  },
  {
    accessorKey: "tipoOperacao",
    header: "Tipo de Operação",
    cell: ({ row }: CellContext<Transaction, any>) => (
      <Badge variant="outline">
        {(row.getValue("tipoOperacao") as string) || "-"}
      </Badge>
    ),
  },
  {
    accessorKey: "remetenteDestinatario",
    header: "Remetente/Destinatário",
    cell: ({ row }: CellContext<Transaction, any>) => (
      <div className="max-w-[150px] truncate">
        {(row.getValue("remetenteDestinatario") as string) || "-"}
      </div>
    ),
  },
  {
    accessorKey: "valor",
    header: ({ column }: HeaderContext<Transaction, any>) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Valor
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }: CellContext<Transaction, any>) => {
      const valor = row.getValue("valor") as number | string;
      const formatted = formatMoneyView(valor.toString());
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

interface TransactionsTableProps {
  initialPage?: number;
  initialSearch?: string;
}

/**
 * Componente de tabela para exibir transações financeiras.
 *
 * Este componente utiliza o hook `useTransactions` para buscar dados paginados
 * e filtrados de transações. Inclui funcionalidades de busca, paginação,
 * estados de loading e error, e formatação adequada dos dados.
 *
 * @param initialPage - Página inicial para carregamento (padrão: 1)
 * @param initialSearch - Texto inicial de busca (padrão: "")
 * @returns JSX.Element - A tabela renderizada com transações
 */
export function TransactionsTable({
  initialPage = 1,
  initialSearch = "",
}: TransactionsTableProps) {
  const [page, setPage] = React.useState(initialPage);
  const [search, setSearch] = React.useState(initialSearch);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Debounce a busca para evitar requisições excessivas
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useTransactions({
    page,
    search: debouncedSearch,
  });

  const { mutate: uploadCsv, isPending: isUploading } = useUploadCsvMutation();

  const table = useReactTable({
    data: data.items,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: data.totalPages,
    state: {
      sorting,
      pagination: {
        pageIndex: data.page - 1,
        pageSize: data.perPage,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: data.page - 1,
          pageSize: data.perPage,
        });
        setPage(newState.pageIndex + 1);
      }
    },
  });

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  }, []);

  const renderTableRows = React.useCallback(() => {
    // Show skeleton only on initial load or when there's no data yet
    if (isLoading && !data.items.length) {
      return Array.from({ length: TABLE_ROWS }).map((_, i) => (
        <TableRow
          key={i}
          className={`${ROW_HEIGHT} ${i % 2 === 1 ? "bg-muted/50" : ""}`}
        >
          {columns.map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row, index) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          className={`${ROW_HEIGHT} ${index % 2 === 1 ? "bg-muted/50" : ""}`}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return Array.from({ length: TABLE_ROWS }).map((_, i) => (
      <TableRow
        key={`empty-${i}`}
        className={`${ROW_HEIGHT} ${i % 2 === 1 ? "bg-muted/50" : ""}`}
      >
        <TableCell colSpan={columns.length}>
          {i === 4 && (
            <div className="text-center text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          )}
        </TableCell>
      </TableRow>
    ));
  }, [isLoading, data.items.length, table, columns]);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-destructive mb-4">
          Erro ao carregar transações: {error?.message}
        </p>
        <Button onClick={() => refetch()}>Tentar novamente</Button>
      </div>
    );
  }

  const handleFileUpload = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Por favor, selecione um arquivo CSV.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    uploadCsv(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        refetch(); // Refresh the transactions list
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />

        <Button
          variant="default"
          className="flex items-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>

        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsDialogOpen(false)}
            />
            <div className="relative bg-background rounded-lg border shadow-lg max-w-md w-full mx-4 p-6">
              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                onClick={() => setIsDialogOpen(false)}
              >
                ✕
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Upload de Arquivo CSV
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Arraste e solte um arquivo CSV ou clique para selecionar.
                  </p>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isUploading
                      ? "border-muted-foreground/50 bg-muted/50"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
                      <p className="text-sm text-muted-foreground">
                        Processando arquivo...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Arraste um arquivo CSV aqui
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ou clique para selecionar
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="hidden"
                        id="csv-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("csv-upload")?.click()
                        }
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Máximo: 10MB • Formato: CSV
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          ) as React.ReactNode)}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {data.items.length} de {data.count} transações
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={data.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm">
            Página {data.page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, data.totalPages))
            }
            disabled={data.page >= data.totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
