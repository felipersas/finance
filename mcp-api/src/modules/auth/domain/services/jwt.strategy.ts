import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtStrategyPort } from '../ports/jwt-strategy.port';
import type { JwtPayload } from '../../strategies/jwt.strategy';

export interface JwtUser {
  userId: string;
  email: string;
  name: string;
}
import type { UserServicePort } from 'src/modules/user/domain/ports/user-service.port';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements JwtStrategyPort
{
  constructor(
    private configService: ConfigService,
    @Inject('UserServicePort')
    private userService: UserServicePort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido');
    }
    const user = await this.userService.findUnique({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
