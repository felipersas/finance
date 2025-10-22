import type { Notification, Prisma } from '@prisma/client';
import { PaginatedResponse } from 'src/common/types/paginated-response';

export interface NotificationRepositoryPort {
  findAll(
    page: number | undefined,
    perPage: number | undefined,
    orderDirection: 'asc' | 'desc',
    userId: string,
  ): Promise<PaginatedResponse<Notification>>;
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
