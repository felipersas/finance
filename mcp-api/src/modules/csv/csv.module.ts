import { Module } from '@nestjs/common';

import { CsvController } from './csv.controller';
import { PrismaService } from '../../prisma.service';
import { CsvService } from './infrastructure/services/csv.service';
import { NubankCsvParser } from './infrastructure/adapters/parsers/nubank-csv.parser';

@Module({
  controllers: [CsvController],
  providers: [
    PrismaService,
    NubankCsvParser,
    {
      provide: 'CSV_PARSERS',
      useFactory: (nubank: NubankCsvParser) => [nubank],
      inject: [NubankCsvParser],
    },
    {
      provide: 'CsvServicePort',
      useClass: CsvService,
    },
    CsvService,
  ],
  exports: [
    {
      provide: 'CsvServicePort',
      useClass: CsvService,
    },
    CsvService,
  ],
})
export class CsvModule {}
