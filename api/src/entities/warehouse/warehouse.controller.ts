import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { AddStockDto } from './dto/add-stock.dto';

@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get()
  async readMany(): Promise<object[]> {
    return await this.service.readMany();
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<object> {
    return await this.service.readOne(id);
  }

  @Post()
  async create(@Body() dto: CreateWarehouseDto): Promise<string> {
    return await this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateWarehouseDto>,
  ): Promise<object> {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }

  @Post(':id/stock')
  @HttpCode(200)
  async addStock(
    @Param('id') id: string,
    @Body() dto: AddStockDto,
  ): Promise<object> {
    return await this.service.addStock(id, dto);
  }

  @Get(':id/stock')
  async getStock(
    @Param('id') id: string,
    @Body('productId') productId?: string,
  ): Promise<object[]> {
    return await this.service.getStock(id, productId);
  }

  @Get('price-lists/all')
  async getAllPriceLists(): Promise<object> {
    return await this.service.getAllPriceLists();
  }

  @Get(':id/price-list')
  async getWarehousePriceList(@Param('id') id: string): Promise<object> {
    return await this.service.getWarehousePriceList(id);
  }
}
