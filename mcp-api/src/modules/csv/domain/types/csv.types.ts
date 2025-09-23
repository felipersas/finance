export interface ParsedCsvRecord {
  data: string;
  valor: number;
  identificador: string;
  descricao: string;
  // Campos extras podem ser adicionados conforme o formato
  [key: string]: any;
}

export interface ProcessingResult {
  processed: number;
  duplicates: number;
  errors: string[];
}
