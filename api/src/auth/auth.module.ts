import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/entities/user/user.service';
import { UserModule } from 'src/entities/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtModuleAsyncOptions } from 'src/config/jwt-module.config';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt-strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtModule, JWTAuthGuard, JwtStrategy],
  imports: [
    UserModule,
    JwtModule.registerAsync(jwtModuleAsyncOptions()),
    PassportModule,
  ],
})
export class AuthModule {}
