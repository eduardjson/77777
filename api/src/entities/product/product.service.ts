import { Injectable } from '@nestjs/common';
import { IProductService } from './dto/i-product-service.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma';
import { promisify } from 'util';
import * as fs from 'fs';

const mkdir = promisify(fs.mkdir);

@Injectable()
export class ProductService implements IProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<string> {
    const createdProduct = await this.prisma.product.create({ data: dto });
    return createdProduct.id;
  }

  async readOne(id: string): Promise<object> {
    return await this.prisma.product.findUniqueOrThrow({ where: { id } });
  }

  async readMany(): Promise<object[]> {
    return await this.prisma.product.findMany();
  }

  async update(id: string, dto: UpdateProductDto): Promise<UpdateProductDto> {
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    return updatedProduct;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }

  async addImages(
    productId: string,
    files: Express.Multer.File[],
  ): Promise<{ images: { id: string; url: string }[] }> {
    const savedImages = await Promise.all(
      files.map((f) => {
        const urlPath = `/uploads/products/${productId}/${f.filename}`;
        return this.prisma.productImage.create({
          data: {
            productId,
            url: urlPath,
          },
        });
      }),
    );
    const result = savedImages.map((img) => ({
      id: img.id,
      url: img.url,
    }));
    return { images: result };
  }

  async getImages(productId: string): Promise<{ id: string; url: string }[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
      select: { id: true, url: true },
    });
    return images;
  }
}
