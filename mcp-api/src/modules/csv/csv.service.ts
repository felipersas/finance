import { Injectable, Logger } from '@nestjs/common';
import { parse } from 'csv-parse';
import { PrismaService } from '../../prisma.service';
import { CreateExtratoRecordDto } from './dto/create-extrato-record.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Readable } from 'stream';

interface ParsedTransaction {
  tipoOperacao?: string;
  remetenteDestinatario?: string;
  documento?: string;
  instituicaoFinanceira?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
}

interface ProcessingResult {
  processed: number;
  duplicates: number;
  errors: string[];
}

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  constructor(private prisma: PrismaService) {}

  async processCsvFile(
    buffer: Buffer,
    userId: string,
  ): Promise<ProcessingResult> {
    const records = await this.parseCsvBuffer(buffer);
    return this.processRecords(records, userId);
  }

  async getAllRecords() {
    return this.prisma.extratoRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecordsByIdentificador(identificador: string) {
    return this.prisma.extratoRecord.findMany({
      where: { identificador: { contains: identificador } },
      orderBy: { data: 'desc' },
    });
  }

  private async parseCsvBuffer(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(
          parse({
            columns: ['data', 'valor', 'identificador', 'descricao'],
            skip_empty_lines: true,
            trim: true,
            from_line: 2,
          }),
        )
        .on('data', (data) => records.push(data))
        .on('error', (error) => {
          this.logger.error('CSV parsing error:', error);
          reject(error);
        })
        .on('end', () => {
          this.logger.log(`Parsed ${records.length} records from CSV`);
          resolve(records);
        });
    });
  }

  private async processRecords(
    records: any[],
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
    record: any,
    rowNumber: number,
    userId: string,
  ): Promise<{
    error?: string;
    isDuplicate?: boolean;
  }> {
    // Validate CSV structure
    const dto = plainToInstance(CreateExtratoRecordDto, record);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      return {
        error: `Row ${rowNumber}: ${validationErrors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ')}`,
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
    const parsedData = this.parseDescription(dto.descricao);

    await this.prisma.extratoRecord.create({
      data: {
        userId,
        data: parsedDate,
        valor: dto.valor,
        identificador: dto.identificador,
        descricao: dto.descricao,
        tipoOperacao: parsedData.tipoOperacao?.toLowerCase() || null,
        remetenteDestinatario:
          parsedData.remetenteDestinatario?.toLowerCase() || null,
        documento: parsedData.documento || null,
        instituicaoFinanceira: parsedData.instituicaoFinanceira || null,
        codigoBanco: parsedData.codigoBanco || null,
        agencia: parsedData.agencia || null,
        conta: parsedData.conta || null,
      },
    });
  }

  private parseDate(dateString: string): Date | null {
    if (!dateString?.trim()) return null;

    const cleanDate = dateString.trim();

    // Try DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    const ddmmyyyy = cleanDate.match(
      /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    );
    if (ddmmyyyy) {
      return this.createValidatedDate(
        parseInt(ddmmyyyy[3], 10), // year
        parseInt(ddmmyyyy[2], 10), // month
        parseInt(ddmmyyyy[1], 10), // day
      );
    }

    // Try YYYY-MM-DD
    const yyyymmdd = cleanDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      return this.createValidatedDate(
        parseInt(yyyymmdd[1], 10), // year
        parseInt(yyyymmdd[2], 10), // month
        parseInt(yyyymmdd[3], 10), // day
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

    // Validate the constructed date matches input
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }

    return null;
  }

  private safeRegexMatch(
    text: string,
    pattern: RegExp,
    expectedGroups: number,
  ): string[] | null {
    const match = text.match(pattern);
    if (match && match.length >= expectedGroups + 1) {
      return match.slice(1);
    }
    return null;
  }

  private parseDescription(descricao: string): ParsedTransaction {
    const cleanDescription = descricao.trim();
    const patterns = [
      () => this.parsePixTransfer(cleanDescription),
      () => this.parseDebitPurchase(cleanDescription),
      () => this.parseBillPayment(cleanDescription),
      () => this.parseTedDoc(cleanDescription),
      () => this.parseGenericTransaction(cleanDescription),
    ];

    for (const pattern of patterns) {
      const result = pattern();
      if (result.tipoOperacao) return result;
    }

    if (!cleanDescription.includes('-')) {
      return { remetenteDestinatario: cleanDescription };
    }

    return {};
  }

  private parsePixTransfer(description: string): ParsedTransaction {
    const pattern =
      /^Transferência enviada pelo Pix\s*-\s*(.+?)\s*-\s*([\d.-/]+)\s*-\s*(.+?)\s*\((\d+)\)\s*Agência:\s*(\d+)\s*Conta:\s*([\d-]+)$/i;

    const groups = this.safeRegexMatch(description, pattern, 6);

    if (groups) {
      const [remetente, documento, instituicao, codigo, agencia, conta] =
        groups;
      return {
        tipoOperacao: 'Transferência Pix',
        remetenteDestinatario: remetente,
        documento: documento,
        instituicaoFinanceira: instituicao,
        codigoBanco: codigo,
        agencia: agencia,
        conta: conta,
      };
    }

    return {};
  }

  private parseDebitPurchase(description: string): ParsedTransaction {
    const match = description.match(/^Compra no débito\s*-\s*(.+)$/i);

    if (match) {
      return {
        tipoOperacao: 'Compra no débito',
        remetenteDestinatario: match[1],
      };
    }

    return {};
  }

  private parseBillPayment(description: string): ParsedTransaction {
    if (description.toLowerCase().includes('pagamento de fatura')) {
      return { tipoOperacao: 'Pagamento de fatura' };
    }

    return {};
  }

  private parseTedDoc(description: string): ParsedTransaction {
    const tedMatch = description.match(/^TED\s*-\s*(.+)/i);
    if (tedMatch) {
      return {
        tipoOperacao: 'TED',
        remetenteDestinatario: tedMatch[1],
      };
    }

    const docMatch = description.match(/^DOC\s*-\s*(.+)/i);
    if (docMatch) {
      return {
        tipoOperacao: 'DOC',
        remetenteDestinatario: docMatch[1],
      };
    }

    return {};
  }

  private parseGenericTransaction(description: string): ParsedTransaction {
    const parsed: ParsedTransaction = {};

    // Extract document number
    const docMatch = description.match(
      /([\d]{2}\.[\d]{3}\.[\d]{3}\/[\d]{4}-[\d]{2})/,
    );
    if (docMatch) parsed.documento = docMatch[1];

    // Extract bank code
    const bankMatch = description.match(/\((\d+)\)/);
    if (bankMatch) parsed.codigoBanco = bankMatch[1];

    // Extract agency and account
    const agencyMatch = description.match(
      /Agência:\s*(\d+)\s*Conta:\s*([\d-]+)/i,
    );
    if (agencyMatch) {
      parsed.agencia = agencyMatch[1];
      parsed.conta = agencyMatch[2];
    }

    // Extract operation type and recipient
    const parts = description.split(' - ');
    if (parts.length > 0) {
      parsed.tipoOperacao = parts[0];
      if (parts.length > 1) {
        parsed.remetenteDestinatario = parts[1];
      }
    }

    // Se não conseguiu extrair nenhum campo útil, retorna tudo como remetenteDestinatario
    if (
      !parsed.tipoOperacao &&
      !parsed.remetenteDestinatario &&
      !parsed.documento &&
      !parsed.codigoBanco &&
      !parsed.agencia &&
      !parsed.conta
    ) {
      return { remetenteDestinatario: description.trim() };
    }

    return parsed;
  }
}
