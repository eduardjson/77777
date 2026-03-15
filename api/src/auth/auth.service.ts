import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/entities/user/user.service';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcrypt';
import { Token, User } from 'generated/prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  register(registerDto: RegisterDto) {
    const createUserDto = registerDto;

    const { repeatPassword: _, ...withoutRepeatPassword } = createUserDto;
    const createdUser = this.userService.create(withoutRepeatPassword);

    return createdUser;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!user) {
      const textError = 'Неверные логин или пароль';
      this.logger.error(textError);
      throw new UnauthorizedException(textError);
    }

    const isPasswordMatch = user?.password
      ? compareSync(password, user.password)
      : false;

    if (!isPasswordMatch) {
      const textError = 'Неверные логин или пароль';
      this.logger.error(textError);
      throw new UnauthorizedException(textError);
    }

    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    const existingToken = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });

    if (existingToken) {
      await this.prismaService.token.delete({
        where: { token: refreshToken },
      });
    }

    return true;
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.prismaService.token
      .delete({
        where: { token: refreshToken },
      })
      .catch(() => null);
    const today = dayjs();

    if (!token) return;
    const exDate = dayjs(token.expires);
    const isExpired = exDate.isBefore(today);

    if (!token || isExpired) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(token.userId);
    if (!user) {
      return;
    }
    return this.generateTokens(user);
  }

  private generateTokens = async (user: User) => {
    const accessToken = this.jwtService.sign({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken: Token = await this.getRefreshToken(user.id);
    const tokens = { accessToken, refreshToken };

    return tokens;
  };

  private getRefreshToken = async (userId: string) => {
    const currentDate = dayjs();

    this.logger.error(this.configService.get('TOKEN_EXPIRATION_UNIT')!);

    const expireDate = currentDate.add(1, 'month').toDate();

    return this.prismaService.token.create({
      data: {
        token: v4(),
        expires: expireDate,
        userId,
      },
    });
  };
}
