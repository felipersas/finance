import { Module } from '@nestjs/common';
import { ExtractsService } from './domain/services/extracts.service';
import { ExtractsController } from './infrastructure/adapters/extracts.controller';
import { ExtractsRepository } from './infrastructure/repositories/extracts.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ExtractsController],
  providers: [
    {
      provide: 'ExtractsRepositoryPort',
      useClass: ExtractsRepository,
    },
    {
      provide: 'ExtractsServicePort',
      useClass: ExtractsService,
    },
    ExtractsService,
    ExtractsRepository,
    PrismaService,
  ],
})
export class ExtractsModule {}
