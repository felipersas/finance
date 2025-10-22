import { Injectable } from '@nestjs/common';
import type { NotificationRepositoryPort } from '../../domain/ports/notification-repository.port';
import { PrismaService } from 'src/prisma.service';
import paginatedResponse from 'src/common/utils/paginated-response';
import { PaginatedResponse } from 'src/common/types/paginated-response';
import type { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number | undefined,
    perPage: number | undefined,
    orderDirection: 'asc' | 'desc' = 'desc',
    userId: string,
  ): Promise<PaginatedResponse<Notification>> {
    const skip = page && perPage ? (page - 1) * perPage : undefined;
    const take = perPage ? perPage : undefined;

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
      },
      skip,
      take,
      orderBy: {
        createdAt: orderDirection,
      },
    });
    const total = await this.prisma.notification.count({ where: { userId } });
    return paginatedResponse(perPage, total, notifications);
  }

  async findMany(
    where?: Prisma.NotificationWhereInput,
  ): Promise<Notification[]> {
    return await this.prisma.notification.findMany({ where });
  }

  async findUnique(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification | null> {
    return await this.prisma.notification.findUnique({ where });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return await this.prisma.notification.create({ data });
  }

  async update(
    where: Prisma.NotificationWhereUniqueInput,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return await this.prisma.notification.update({ where, data });
  }

  async delete(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification> {
    return await this.prisma.notification.delete({ where });
  }
}
