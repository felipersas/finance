import type { JwtPayload, JwtUser } from '../../strategies/jwt.strategy';

export interface JwtStrategyPort {
  validate(payload: JwtPayload): Promise<JwtUser>;
}
