import { Module } from '@nestjs/common';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CsvController],
  providers: [CsvService, PrismaService],
  exports: [CsvService],
})
export class CsvModule {}
