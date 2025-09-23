import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import type { LocalStrategyPort } from '../ports/local-strategy.port';
import type { UserServicePort } from 'src/modules/user/domain/ports/user-service.port';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class LocalStrategy
  extends PassportStrategy(Strategy)
  implements LocalStrategyPort
{
  constructor(@Inject('UserServicePort') private userService: UserServicePort) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<LocalUser> {
    if (!email || !password) {
      throw new UnauthorizedException('Email e senha são obrigatórios');
    }
    const user = await this.userService.findUnique({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
