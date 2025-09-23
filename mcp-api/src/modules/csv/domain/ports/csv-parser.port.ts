import type { Buffer } from 'buffer';
import { ParsedCsvRecord } from '../types/csv.types';

export interface CsvParserPort {
  /**
   * Detecta se o parser suporta o arquivo (ex: checa headers, formato, etc)
   */
  supports(buffer: Buffer): Promise<boolean>;
  /**
   * Faz o parse do buffer para registros genéricos do domínio
   */
  parse(buffer: Buffer): Promise<ParsedCsvRecord[]>;
}
