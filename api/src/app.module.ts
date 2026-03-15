import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './entities/product/product.module';
import { UserModule } from './entities/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JWTAuthGuard } from './auth/guards/jwt-auth.guard';
import { ChatGateway } from './entities/chat/chat.gateway';
import { ChatService } from './entities/chat/chat.service';
import { AttachmentsModule } from './entities/attachments/attachments.module';
import { WarehouseModule } from './entities/warehouse/warehouse.module';
import { ObjectModule } from './entities/object/object.module';
import { ShipmentModule } from './entities/shipment/shipment.module';
import { ProjectModule } from './entities/project/project.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    ProductModule,
    UserModule,
    AttachmentsModule,
    WarehouseModule,
    ObjectModule,
    ShipmentModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
    ChatService,
    ChatGateway,
  ],
})
export class AppModule {}
