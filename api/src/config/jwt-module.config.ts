import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtModuleAsyncOptions } from '@nestjs/jwt';

const jwtModuleOptions = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get('JWT_EXPIRES', '5m'),
  },
});

export const jwtModuleAsyncOptions = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => jwtModuleOptions(config),
});
