import type { LocalUser } from '../../strategies/local.strategy';

export interface LocalStrategyPort {
  validate(email: string, password: string): Promise<LocalUser>;
}
