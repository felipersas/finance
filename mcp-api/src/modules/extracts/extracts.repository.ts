import { Injectable } from '@nestjs/common';
import paginatedResponse from 'src/common/utils/paginated-response';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ExtractsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number | undefined,
    perPage: number | undefined,
    orderDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ) {
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
      },
    });
    const total = await this.prisma.extratoRecord.count({ where: { userId } });
    return paginatedResponse(perPage, total, extracts);
  }
}
