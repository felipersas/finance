import type { Buffer } from 'buffer';
import type { ProcessingResult } from '../types/csv.types';

export interface CsvServicePort {
  /**
   * Processa um arquivo CSV genérico, detectando o parser adequado
   */
  processCsvFile(buffer: Buffer, userId: string): Promise<ProcessingResult>;

  /**
   * Retorna todos os registros de extrato
   */
  getAllRecords(): Promise<any[]>;

  /**
   * Retorna registros filtrados por identificador
   */
  getRecordsByIdentificador(identificador: string): Promise<any[]>;
}
