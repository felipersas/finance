import { Injectable, Inject } from '@nestjs/common';
import type { UserServicePort } from '../ports/user-service.port';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import { InternalServerError } from 'src/common/errors/internal-server-error';
import type { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService implements UserServicePort {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.userRepository.findUnique(where);
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const created = await this.userRepository.create(data);
    if (!created) {
      throw new InternalServerError('Falha ao criar usuário');
    }
    return created;
  }
}
