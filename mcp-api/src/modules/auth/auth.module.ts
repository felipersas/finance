import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './domain/services/auth.service';
import { AuthController } from './infrastructure/adapters/controllers/auth.controller';
import { JwtAuthGuard } from './infrastructure/adapters/guards/jwt-auth.guard';
import { LocalAuthGuard } from './infrastructure/adapters/guards/local-auth.guard';
import { JwtStrategy } from './domain/services/jwt.strategy';
import { LocalStrategy } from './domain/services/local.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: {
          expiresIn: '24h', // More explicit expiration
          issuer: 'mcp-api', // Add issuer for better security
          audience: 'mcp-client', // Add audience for better security
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AuthServicePort',
      useClass: AuthService,
    },
    {
      provide: 'JwtStrategyPort',
      useClass: JwtStrategy,
    },
    {
      provide: 'LocalStrategyPort',
      useClass: LocalStrategy,
    },
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard, LocalAuthGuard],
})
export class AuthModule {}
