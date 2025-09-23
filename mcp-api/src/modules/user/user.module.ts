import { Module } from '@nestjs/common';

import { UserService } from './domain/services/user.service';
import { UserController } from './infrastructure/adapters/controllers/user.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepository,
    },
    {
      provide: 'UserServicePort',
      useClass: UserService,
    },
    UserService,
    UserRepository,
    PrismaService,
  ],
  exports: [
    UserService,
    {
      provide: 'UserServicePort',
      useClass: UserService,
    },
  ],
})
export class UserModule {}
