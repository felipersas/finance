import { Injectable } from '@nestjs/common';
import type { ExtractsRepositoryPort } from '../../domain/ports/extracts-repository.port';
import { PrismaService } from 'src/prisma.service';
import type { ExtratoType, ExtratoRecord } from '@prisma/client';
import paginatedResponse from 'src/common/utils/paginated-response';

@Injectable()
export class ExtractsRepository implements ExtractsRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number | undefined,
    perPage: number | undefined,
    orderDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<any> {
    const skip = page && perPage ? (page - 1) * perPage : undefined;
    const take = perPage ? perPage : undefined;

    const extracts = await this.prisma.extratoRecord.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: orderDirection,
      },
      select: {
        id: true,
        data: true,
        valor: true,
        remetenteDestinatario: true,
        descricao: true,
        tipo: true,
      },
    });
    const total = await this.prisma.extratoRecord.count({ where: { userId } });
    return paginatedResponse(perPage, total, extracts);
  }

  async updateTipo(
    id: string,
    tipo: ExtratoType,
    userId: string,
  ): Promise<ExtratoRecord> {
    return this.prisma.extratoRecord.update({
      where: {
        id,
        userId,
      },
      data: {
        tipo,
      },
    });
  }
}
