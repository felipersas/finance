import type { ExtratoType, Prisma, ExtratoRecord } from '@prisma/client';

export interface ExtractsServicePort {
  findAll(params: any, userId: string): Promise<any>;
  updateTipo(
    id: string,
    tipo: ExtratoType,
    userId: string,
  ): Promise<ExtratoRecord>;
}
