import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { SignupDto } from '../../dto/signup.dto';
import type { AuthServicePort, AuthResponse, JwtPayload } from '../ports/auth-service.port';
import type { LocalUser } from '../../strategies/local.strategy';
import { Conflict } from 'src/common/errors/conflict';
import type { UserServicePort } from 'src/modules/user/domain/ports/user-service.port';

@Injectable()
export class AuthService implements AuthServicePort {
  constructor(
    private jwtService: JwtService,
    @Inject('UserServicePort')
    private userService: UserServicePort,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existing = await this.userService.findUnique({
      email: dto.email,
    });
    if (existing) throw new Conflict('Esse email já está em uso');

    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.userService.create({
      ...dto,
      password: hash,
    });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      token: token,
    };
  }

  login(user: LocalUser): AuthResponse {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return {
      name: user.name,
      token: token,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<LocalUser | null> {
    const user = await this.userService.findUnique({ id: payload.sub });
    if (!user || user.email !== payload.email) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
