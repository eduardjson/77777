import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('find-all')
  findAll() {
    return this.userService.findAll();
  }

  @Get('all-users')
  async findAllUsers() {
    return this.userService.findAllWithoutPasswords();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('find-by-username/:username')
  async findByUsername(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);

    if (!user) return;

    const { password: _, ...withoutPassword } = user;

    return withoutPassword;
  }

  @Get('find-by-phone/:phone')
  async findByPhone(@Param('phone') phone: string) {
    const user = await this.userService.findByPhone(phone);

    if (!user) return;
    const { password: _, ...withoutPassword } = user;

    return withoutPassword;
  }

  @Get('find-by-email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) return;
    const { password: _, ...withoutPassword } = user;

    return withoutPassword;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('/me')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const user = await this.userService.findById(userId);
    if (!user) return null;

    const { password: _, ...withoutPassword } = user;
    return withoutPassword;
  }
}
