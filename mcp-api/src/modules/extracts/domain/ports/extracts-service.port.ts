import type { ExtratoType, ExtratoRecord } from '@prisma/client';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import { ExtractItem } from 'src/common/types/extract-item';

export interface ExtractsServicePort {
  findAll(params: any, userId: string): Promise<PaginatedResponse<ExtractItem>>;
  updateTipo(
    id: string,
    tipo: ExtratoType,
    userId: string,
  ): Promise<ExtratoRecord>;
}
