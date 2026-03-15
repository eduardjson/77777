import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { MessageUpdatePayload, MessageWithAttachments } from 'src/types';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages(): Promise<MessageWithAttachments[]> {
    return this.prisma.message.findMany({
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async clearMessages(): Promise<Prisma.BatchPayload> {
    return this.prisma.message.deleteMany();
  }

  async createMessage(
    data: Prisma.MessageCreateInput & { attachments?: any[] },
  ) {
    const { attachments, ...messageData } = data;

    return this.prisma.message.create({
      data: {
        ...messageData,
        attachments: attachments
          ? {
              create: attachments,
            }
          : undefined,
      },
      include: {
        attachments: true,
      },
    });
  }

  async updateMessage(payload: MessageUpdatePayload) {
    const { id, text } = payload;
    return this.prisma.message.update({
      where: { id },
      data: { text },
      include: {
        attachments: true,
      },
    });
  }

  async removeMessage(where: Prisma.MessageWhereUniqueInput) {
    return this.prisma.message.delete({
      where,
      include: {
        attachments: true,
      },
    });
  }
}
