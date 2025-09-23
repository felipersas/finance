import type { SignupDto } from '../../dto/signup.dto';
import type { LocalUser } from '../../strategies/local.strategy';

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

export interface AuthServicePort {
  signup(dto: SignupDto): Promise<AuthResponse>;
  login(user: LocalUser): AuthResponse;
  validateJwtPayload(payload: JwtPayload): Promise<LocalUser | null>;
}
