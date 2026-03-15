import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma';
import { genSaltSync, hashSync } from 'bcrypt';
import { patch } from 'axios';
import { User } from 'generated/prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = this.hashPassword(createUserDto.password);
    const userData = { ...createUserDto, password: hashedPassword };

    const existingUserByUsername = await this.findByUsername(
      createUserDto.username,
    );
    if (existingUserByUsername) {
      const message = 'Пользователь с таким никнеймом уже существует!';
      this.logger.error(message);
      throw new ConflictException(message);
    }

    const existingUserByEmail = await this.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      const message = 'Пользователь с таким email уже существует!';
      this.logger.error(message);
      throw new ConflictException(message);
    }

    const existingUserByPhone = await this.findByPhone(createUserDto.phone);
    if (existingUserByPhone) {
      const message = 'Пользователь с таким номером телефона  уже существует!';
      this.logger.error(message);
      throw new ConflictException(message);
    }

    const newUser = await this.prismaService.user
      .create({
        data: userData,
      })
      .catch((error) => {
        this.logger.error('Ошибка при создании нового пользователя!', error);
        throw new BadRequestException(
          'Ошибка при создании нового пользователя!',
        );
      });

    const { password: _1, ...withoutPassword } = newUser;

    return withoutPassword;
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  async findAllWithoutPasswords(): Promise<Omit<User, 'password'>[]> {
    try {
      const usersWithPasswords = await this.prismaService.user.findMany();

      const usersWithoutPasswords = usersWithPasswords.map(
        ({ password, ...rest }) => rest,
      );

      return usersWithoutPasswords;
    } catch (error) {
      this.logger.error('Ошибка при получении списка пользователей:', error);
      throw new Error('Ошибка при получении списка пользователей.');
    }
  }

  findById(id: string) {
    return this.prismaService.user
      .findUnique({
        where: { id },
      })
      .then((foundedUser) => {
        if (!foundedUser) {
          return null;
        }

        return foundedUser;
      })
      .catch((error) => {
        this.logger.error('Пользователь по ID не найден', error);
        throw new NotFoundException('Пользователь по ID не найден');
      });
  }

  async findByUsername(username: string) {
    return this.prismaService.user
      .findUnique({
        where: { username },
      })
      .then((foundedUser) => {
        if (!foundedUser) {
          return null;
        }

        return foundedUser;
      })
      .catch((error) => {
        this.logger.error('Пользователь по никнейму не найден', error);
        throw new NotFoundException('Пользователь по никнейму не найден');
      });
  }

  async findByEmail(email: string) {
    return this.prismaService.user
      .findUnique({
        where: { email },
      })
      .then((foundedUser) => {
        if (!foundedUser) {
          return null;
        }

        return foundedUser;
      })
      .catch((error) => {
        this.logger.error('Пользователь по email не найден', error);
        throw new NotFoundException('Пользователь по email не найден');
      });
  }

  async findByPhone(phone: string) {
    return this.prismaService.user
      .findUnique({
        where: { phone },
      })
      .then((foundedUser) => {
        if (!foundedUser) {
          return null;
        }

        return foundedUser;
      })
      .catch((error) => {
        this.logger.error('Пользователь по номеру телефона не найден', error);
        throw new NotFoundException(
          'Пользователь по номеру телефона не найден',
        );
      });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      data: updateUserDto,
      where: { id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
