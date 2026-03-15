import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaService } from 'src/prisma';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, ChatService, ChatGateway],
})
export class ChatModule {}
