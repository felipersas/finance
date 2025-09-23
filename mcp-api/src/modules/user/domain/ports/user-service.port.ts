import type { User, Prisma } from '@prisma/client';

export interface UserServicePort {
  findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
}
