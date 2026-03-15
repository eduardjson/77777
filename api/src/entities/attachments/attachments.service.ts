import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { createWriteStream, unlinkSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFile(file: Express.Multer.File, messageId: number) {
    const fileName = `${uuidv4()}-${file.originalname}`;
    const uploadDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadDir, fileName);

    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const writeStream = createWriteStream(filePath);
    writeStream.write(file.buffer);
    writeStream.end();

    return this.prisma.attachment.create({
      data: {
        messageId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: fileName,
      },
    });
  }

  async getFile(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Файл не найден');
    }

    return attachment;
  }

  async deleteFile(attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException('Файл не найден');
    }

    try {
      const filePath = join(process.cwd(), 'uploads', attachment.filePath);
      unlinkSync(filePath);
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
    }

    return this.prisma.attachment.delete({
      where: { id: attachmentId },
    });
  }

  async getMessageAttachments(messageId: number) {
    return this.prisma.attachment.findMany({
      where: { messageId },
    });
  }
}
