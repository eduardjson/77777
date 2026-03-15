import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma';

@Module({
  imports: [PrismaModule],
  // controllers: [PriceController],
  // providers: [PriceService],
  // exports: [PriceService],
})
export class PriceModule {}
