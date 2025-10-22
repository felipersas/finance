import type { Notification, Prisma } from '@prisma/client';
import { PaginatedResponse } from 'src/common/types/paginated-response';

export interface NotificationServicePort {
  findAll(
    params: any,
    userId: string,
  ): Promise<PaginatedResponse<Notification>>;
  findMany(userId?: string): Promise<Notification[]>;
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
