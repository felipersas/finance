import { Injectable, Inject } from '@nestjs/common';

import type { ExtractsServicePort } from '../ports/extracts-service.port';
import type { ExtractsRepositoryPort } from '../ports/extracts-repository.port';
import type { ExtratoType, ExtratoRecord } from '@prisma/client';
import type { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { ExtractItem } from 'src/common/types/extract-item';

@Injectable()
export class ExtractsService implements ExtractsServicePort {
  constructor(
    @Inject('ExtractsRepositoryPort')
    private readonly extractsRepository: ExtractsRepositoryPort,
  ) {}

  async findAll(
    params: PaginatedParamsDto,
    userId: string,
  ): Promise<PaginatedResponse<ExtractItem>> {
    return this.extractsRepository.findAll(
      params.page,
      params.perPage,
      params.orderDirection ?? 'desc',
      userId,
    );
  }

  async updateTipo(
    id: string,
    tipo: ExtratoType,
    userId: string,
  ): Promise<ExtratoRecord> {
    return await this.extractsRepository.updateTipo(id, tipo, userId);
  }
}
