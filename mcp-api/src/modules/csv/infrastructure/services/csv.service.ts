import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma.service';
import type { CsvParserPort } from '../../domain/ports/csv-parser.port';
import type { CsvServicePort } from '../../domain/ports/csv-service.port';
import type {
  ParsedCsvRecord,
  ProcessingResult,
} from '../../domain/types/csv.types';
import { CreateExtratoRecordDto } from '../../dto/create-extrato-record.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CsvService implements CsvServicePort {
  private readonly logger = new Logger(CsvService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('CSV_PARSERS') private readonly parsers: CsvParserPort[],
  ) {}

  async getAllRecords(): Promise<any[]> {
    return this.prisma.extratoRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecordsByIdentificador(identificador: string): Promise<any[]> {
    return this.prisma.extratoRecord.findMany({
      where: { identificador: { contains: identificador } },
      orderBy: { data: 'desc' },
    });
  }

  async processCsvFile(
    buffer: Buffer,
    userId: string,
  ): Promise<ProcessingResult> {
    const parser = await this.detectParser(buffer);
    if (!parser) {
      throw new Error(
        'Formato de CSV não suportado. Nenhum parser reconheceu o arquivo.',
      );
    }
    const records = await parser.parse(buffer);
    return this.processRecords(records, userId);
  }

  private async detectParser(buffer: Buffer): Promise<CsvParserPort | null> {
    for (const parser of this.parsers) {
      if (await parser.supports(buffer)) {
        return parser;
      }
    }
    return null;
  }

  private async processRecords(
    records: ParsedCsvRecord[],
    userId: string,
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      processed: 0,
      duplicates: 0,
      errors: [],
    };

    for (const [index, record] of records.entries()) {
      const rowNumber = index + 2;
      try {
        const processedRecord = await this.processRecord(
          record,
          rowNumber,
          userId,
        );
        if (processedRecord.error) {
          result.errors.push(processedRecord.error);
          continue;
        }
        if (processedRecord.isDuplicate) {
          result.duplicates++;
          continue;
        }
        result.processed++;
      } catch (error) {
        this.logger.error(
          `Error processing record at row ${rowNumber}:`,
          error,
        );
        result.errors.push(
          `Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
    return result;
  }

  private async processRecord(
    record: ParsedCsvRecord,
    rowNumber: number,
    userId: string,
  ): Promise<{ error?: string; isDuplicate?: boolean }> {
    // Validate CSV structure
    const dto = plainToInstance(CreateExtratoRecordDto, record);
    const validationErrors = await validate(dto);
    if (validationErrors.length > 0) {
      return {
        error: `Row ${rowNumber}: ${validationErrors.map((e) => Object.values(e.constraints || {}).join(', ')).join('; ')}`,
      };
    }
    // Parse and validate date
    const parsedDate = this.parseDate(dto.data);
    if (!parsedDate) {
      return { error: `Row ${rowNumber}: Invalid date format: "${dto.data}"` };
    }
    // Check for duplicates
    const isDuplicate = await this.isDuplicateRecord(dto.identificador);
    if (isDuplicate) {
      this.logger.debug(
        `Duplicate record found for identificador: ${dto.identificador}`,
      );
      return { isDuplicate: true };
    }
    // Create record
    await this.createRecord(dto, parsedDate, userId);
    return {};
  }

  private async isDuplicateRecord(identificador: string): Promise<boolean> {
    const existingRecord = await this.prisma.extratoRecord.findUnique({
      where: { identificador },
    });
    return !!existingRecord;
  }

  private async createRecord(
    dto: CreateExtratoRecordDto,
    parsedDate: Date,
    userId: string,
  ): Promise<void> {
    // Aqui pode-se adicionar lógica para mapear campos extras de outros formatos
    await this.prisma.extratoRecord.create({
      data: {
        userId,
        data: parsedDate,
        valor: dto.valor,
        identificador: dto.identificador,
        descricao: dto.descricao,
        tipoOperacao: dto.tipoOperacao ?? null,
        remetenteDestinatario: dto.remetenteDestinatario ?? null,
        documento: dto.documento ?? null,
        instituicaoFinanceira: dto.instituicaoFinanceira ?? null,
        codigoBanco: dto.codigoBanco ?? null,
        agencia: dto.agencia ?? null,
        conta: dto.conta ?? null,
        tipo: 'Pessoal',
      },
    });
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString?.trim()) return null;
    const cleanDate = dateString.trim();
    // Try DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const ddmmyyyy = cleanDate.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
    if (ddmmyyyy) {
      return this.createValidatedDate(
        parseInt(ddmmyyyy[3], 10),
        parseInt(ddmmyyyy[2], 10),
        parseInt(ddmmyyyy[1], 10),
      );
    }
    // Try YYYY-MM-DD
    const yyyymmdd = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      return this.createValidatedDate(
        parseInt(yyyymmdd[1], 10),
        parseInt(yyyymmdd[2], 10),
        parseInt(yyyymmdd[3], 10),
      );
    }
    // Fallback to native parsing
    const nativeDate = new Date(cleanDate);
    return !isNaN(nativeDate.getTime()) ? nativeDate : null;
  }

  private createValidatedDate(
    year: number,
    month: number,
    day: number,
  ): Date | null {
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }
}
