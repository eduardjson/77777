import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { ObjectService } from './object.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Controller('objects')
export class ObjectController {
  constructor(private readonly service: ObjectService) {}

  @Get()
  async readMany(): Promise<object[]> {
    return await this.service.readMany();
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<object> {
    return await this.service.readOne(id);
  }

  @Post()
  async create(@Body() dto: CreateObjectDto): Promise<string> {
    return await this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateObjectDto>,
  ): Promise<object> {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }
}
