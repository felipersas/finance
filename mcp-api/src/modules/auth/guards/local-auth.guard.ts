import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // This guard uses the 'local' strategy for username/password authentication
  // It will automatically call the LocalStrategy.validate() method
}
