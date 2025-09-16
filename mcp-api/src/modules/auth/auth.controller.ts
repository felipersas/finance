import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { Public } from '../../common/decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalUser } from './strategies/local.strategy';

// Define the request interface for authenticated requests
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
    // The LocalAuthGuard has already validated the credentials via LocalStrategy
    // req.user contains the validated user information
    return {
      message: 'Login realizado com sucesso',
      data: this.authService.login(req.user),
    };
  }
}
