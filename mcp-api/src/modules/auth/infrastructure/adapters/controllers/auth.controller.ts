import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../../../domain/services/auth.service';
import { SignupDto } from '../../../dto/signup.dto';
import { Public } from 'src/common/decorators/public.decorator';
import type { LocalUser } from '../../../domain/services/local.strategy';
import { LocalAuthGuard } from '../guards/local-auth.guard';

interface AuthenticatedRequest extends Request {
  user: LocalUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return {
      message: 'Cadastro realizado com sucesso',
      data: await this.authService.signup(dto),
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(@Request() req: AuthenticatedRequest) {
    return {
      message: 'Login realizado com sucesso',
      data: this.authService.login(req.user),
    };
  }
}
