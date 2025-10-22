import type { Notification, Prisma } from '@prisma/client';

export interface NotificationRepositoryPort {
  findMany(where?: Prisma.NotificationWhereInput): Promise<Notification[]>;
  findUnique(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification | null>;
  create(data: Prisma.NotificationCreateInput): Promise<Notification>;
  update(
    where: Prisma.NotificationWhereUniqueInput,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification>;
  delete(where: Prisma.NotificationWhereUniqueInput): Promise<Notification>;
}
