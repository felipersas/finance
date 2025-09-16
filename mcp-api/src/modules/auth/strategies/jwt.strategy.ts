import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  userId: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
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

    // Validate that the user still exists in the database
    const user = await this.userService.findUnique({
      id: payload.sub,
    });

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
