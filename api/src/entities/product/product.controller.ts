import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const productId = req.params.id;
    const base = './uploads/products';
    const dir = `${base}/${productId}`;
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
  },
});

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  async readMany(): Promise<object[]> {
    return await this.service.readMany();
  }

  @Get(':id')
  async readOne(@Param('id') id: string): Promise<object> {
    return await this.service.readOne(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<string> {
    return await this.service.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<UpdateProductDto> {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.service.delete(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 20, { storage }))
  @HttpCode(200)
  async addImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ images: { id: string; url: string }[] }> {
    return await this.service.addImages(id, files);
  }

  @Get(':id/images')
  async getImages(
    @Param('id') id: string,
  ): Promise<{ id: string; url: string }[]> {
    return await this.service.getImages(id);
  }
}
