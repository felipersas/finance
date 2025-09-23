import type { ExtratoType, Prisma, ExtratoRecord } from '@prisma/client';

export interface ExtractsRepositoryPort {
  findAll(
    page: number | undefined,
    perPage: number | undefined,
    orderDirection: 'asc' | 'desc',
    userId: string,
  ): Promise<any>;
  updateTipo(
    id: string,
    tipo: ExtratoType,
    userId: string,
  ): Promise<ExtratoRecord>;
}
