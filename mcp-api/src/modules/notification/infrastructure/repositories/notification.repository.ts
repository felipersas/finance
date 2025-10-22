import { Injectable } from '@nestjs/common';
import type { NotificationRepositoryPort } from '../../domain/ports/notification-repository.port';
import { PrismaService } from 'src/prisma.service';
import type { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

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
