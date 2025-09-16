import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from './user.repository';
import { InternalServerError } from 'src/common/errors/internal-server-error';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUnique(where: Prisma.UserWhereUniqueInput) {
    return await this.userRepository.findUnique(where);
  }

  async create(data: Prisma.UserCreateInput) {
    const created = await this.userRepository.create(data);
    if (!created) {
      throw new InternalServerError('Falha ao criar usuário');
    }
    return created;
  }
}
