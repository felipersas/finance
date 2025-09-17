import { Injectable } from '@nestjs/common';
import { PaginatedParamsDto } from 'src/common/dtos/paginated-params.dto';
import { ExtractsRepository } from './extracts.repository';

@Injectable()
export class ExtractsService {
  constructor(private readonly extractsRepository: ExtractsRepository) {}

  async findAll(params: PaginatedParamsDto, userId: string) {
    return this.extractsRepository.findAll(
      params.page,
      params.perPage,
      params.orderDirection,
      userId,
    );
  }
}
