import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/user.service';

export interface LocalUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      usernameField: 'email', // Use email instead of username
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<LocalUser> {
    if (!email || !password) {
      throw new UnauthorizedException('Email e senha são obrigatórios');
    }

    // Find user by email
    const user = await this.userService.findUnique({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Return user without password
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
