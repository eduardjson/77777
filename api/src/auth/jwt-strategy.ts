import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/entities/user/user.service';
import { JWTPayload } from './interfaces/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    const jwtSecret = configService.get<string | undefined>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET must be provided in the configuration.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(JWTPayload: JWTPayload) {
    const user = await this.userService.findById(JWTPayload.id).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return JWTPayload;
  }
}
