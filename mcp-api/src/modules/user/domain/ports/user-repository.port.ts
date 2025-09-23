import type { User, Prisma } from '@prisma/client';

export interface UserRepositoryPort {
  findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
}
