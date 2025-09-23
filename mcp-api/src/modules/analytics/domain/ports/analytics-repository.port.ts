import type { Prisma } from '@prisma/client';
import type { UserBalance, UserDayActivity } from '../types/analytics.types';

export interface AnalyticsRepositoryPort {
  findUserBalance(
    userId: string,
    where?: Prisma.ExtratoRecordWhereInput,
  ): Promise<UserBalance>;
  findUser7daysActivity(
    userId: string,
    where?: Prisma.ExtratoRecordWhereInput,
  ): Promise<UserDayActivity[]>;
}
