import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtUser | undefined,
    ctx: ExecutionContext,
  ): JwtUser | string => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
