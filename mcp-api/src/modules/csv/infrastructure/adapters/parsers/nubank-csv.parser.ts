import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import type { CsvParserPort } from '../../../domain/ports/csv-parser.port';
import type { ParsedCsvRecord } from '../../../domain/types/csv.types';

// Função utilitária para extrair campos da descrição Nubank
function parseNubankDescription(descricao: string): Record<string, string> {
  // Divide por ' - ' (traço e espaço)
  const parts = descricao.split(' - ');
  // Mapeamento para os campos esperados pelo DTO/banco
  const mapped: Record<string, string> = {};
  if (parts[0]) mapped.tipoOperacao = parts[0].trim();
  if (parts[1]) mapped.remetenteDestinatario = parts[1].trim();
  if (parts[2]) mapped.documento = parts[2].trim();
  if (parts[3]) mapped.instituicaoFinanceira = parts[3].trim();
  if (parts[4]) mapped.extra = parts.slice(4).join(' - ').trim();
  return mapped;
}

@Injectable()
export class NubankCsvParser implements CsvParserPort {
  async supports(buffer: Buffer): Promise<boolean> {
    // Nubank CSV geralmente tem header: "Data,Valor,Identificador,Descricao"
    const firstLine = buffer.toString('utf8').split('\n')[0];
    return await Promise.resolve(
      firstLine.trim().toLowerCase() === 'data,valor,identificador,descrição',
    );
  }

  async parse(buffer: Buffer): Promise<ParsedCsvRecord[]> {
    return new Promise((resolve, reject) => {
      const records: ParsedCsvRecord[] = [];
      const stream = Readable.from(buffer);
      stream
        .pipe(
          parse({
            columns: ['Data', 'Valor', 'Identificador', 'Descrição'],
            skip_empty_lines: true,
            trim: true,
            from_line: 2,
          }),
        )
        .on('data', (data: ParsedCsvRecord) => {
          // Tipagem explícita dos campos esperados
          const base: ParsedCsvRecord = {
            data: typeof data['Data'] === 'string' ? data['Data'] : '',
            valor:
              typeof data['Valor'] === 'number'
                ? data['Valor']
                : Number(data['Valor'] ?? 0),
            identificador:
              typeof data['Identificador'] === 'string'
                ? data['Identificador']
                : '',
            descricao:
              typeof data['Descrição'] === 'string' ? data['Descrição'] : '',
          };
          // Extrai campos da descrição
          const parsedDescricao = parseNubankDescription(base.descricao);
          // Mescla os campos extraídos ao registro original
          const merged: ParsedCsvRecord = { ...base, ...parsedDescricao };
          records.push(merged);
        })
        .on('error', (error) => reject(error))
        .on('end', () => resolve(records));
    });
  }
}
