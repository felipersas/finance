import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { Conflict } from '../../common/errors/conflict';
import { LocalUser } from './strategies/local.strategy';

export interface AuthResponse {
  id?: string;
  name: string;
  email?: string;
  createdAt?: Date;
  token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existing = await this.userService.findUnique({
      email: dto.email,
    });
    if (existing) throw new Conflict('Esse email já está em uso');

    const hash = await bcrypt.hash(dto.password, 12); // Increased salt rounds for better security
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

  /**
   * This method is called by the LocalStrategy after successful validation
   * It generates a JWT token for the authenticated user
   */
  login(user: LocalUser): AuthResponse {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      name: user.name,
      token: token,
    };
  }

  /**
   * Validate JWT token payload
   * Used internally by JWT strategy
   */
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
