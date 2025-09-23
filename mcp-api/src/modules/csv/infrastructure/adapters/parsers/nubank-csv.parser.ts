import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import type { CsvParserPort } from '../../../domain/ports/csv-parser.port';
import type { ParsedCsvRecord } from '../../../domain/types/csv.types';

@Injectable()
export class NubankCsvParser implements CsvParserPort {
  async supports(buffer: Buffer): Promise<boolean> {
    // Nubank CSV geralmente tem header: "Data,Valor,Identificador,Descricao"
    const firstLine = buffer.toString('utf8').split('\n')[0];
    return (
      firstLine.trim().toLowerCase() === 'data,valor,identificador,descrição'
    );
  }

  async parse(buffer: Buffer): Promise<ParsedCsvRecord[]> {
    return new Promise((resolve, reject) => {
      const records: ParsedCsvRecord[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(
          parse({
            columns: ['Data', 'Valor', 'Identificador', 'Descricao'],
            skip_empty_lines: true,
            trim: true,
            from_line: 2,
          }),
        )
        .on('data', (data) => {
          // Valor pode vir como string, converter para number
          data.valor = Number(data.valor);
          records.push(data);
        })
        .on('error', (error) => reject(error))
        .on('end', () => resolve(records));
    });
  }
}
