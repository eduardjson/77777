import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import type { Response } from 'express';

import { Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

interface UploadedFileInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
}

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const attachment = await this.attachmentsService.getFile(id);
    const filePath = join(process.cwd(), 'uploads', attachment.filePath);
    const file = createReadStream(filePath);

    res.set({
      'Content-Type': attachment.fileType,
      'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
    });

    return new StreamableFile(file);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadedFiles: UploadedFileInfo[] = [];

    for (const file of files) {
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

      uploadedFiles.push({
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        filePath: fileName,
      });
    }

    return uploadedFiles;
  }
}
