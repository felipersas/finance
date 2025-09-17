import { Module } from '@nestjs/common';
import { ExtractsService } from './extracts.service';
import { ExtractsController } from './extracts.controller';
import { ExtractsRepository } from './extracts.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ExtractsController],
  providers: [ExtractsService, ExtractsRepository, PrismaService],
})
export class ExtractsModule {}
