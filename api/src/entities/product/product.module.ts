import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PriceModule } from '../price/price.module'; // путь к вашему модулю цен

@Module({
  imports: [PrismaModule, PriceModule], // добавляем
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
