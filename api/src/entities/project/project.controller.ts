import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 20 },
      { name: 'documents', maxCount: 10 },
    ]),
  )
  async create(
    @Body() dto: any,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    if (dto.estimate && typeof dto.estimate === 'string') {
      try {
        dto.estimate = JSON.parse(dto.estimate);
      } catch (e) {
        throw new BadRequestException('Invalid estimate format');
      }
    }
    const createDto: CreateProjectDto = {
      name: dto.name,
      description: dto.description,
      estimate: dto.estimate,
    };

    return this.projectService.create(createDto, files);
  }

  @Get()
  async findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 20 },
      { name: 'documents', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.projectService.update(id, dto, files);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.projectService.delete(id);
    return { message: 'Проект успешно удален' };
  }

  // Существующий метод (оставляем для обратной совместимости)
  @Get('images/:id')
  async getImage(@Param('id') id: string, @Res() res: express.Response) {
    const image = await this.projectService.getImage(id);
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${image.filename}"`,
    );
    res.send(image.data);
  }

  // НОВЫЙ МЕТОД: получение изображения как blob через StreamableFile
  @Get('images/:id/blob')
  async getImageBlob(@Param('id') id: string): Promise<StreamableFile> {
    const image = await this.projectService.getImage(id);

    return new StreamableFile(image.data, {
      type: image.mimeType,
      disposition: `inline; filename="${encodeURIComponent(image.filename)}"`,
      length: image.size,
    });
  }

  // Существующий метод (оставляем для обратной совместимости)
  @Get('documents/:id')
  async getDocument(@Param('id') id: string, @Res() res: express.Response) {
    const document = await this.projectService.getDocument(id);
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.filename}"`,
    );
    res.send(document.data);
  }

  // НОВЫЙ МЕТОД: получение документа как blob через StreamableFile
  @Get('documents/:id/blob')
  async getDocumentBlob(@Param('id') id: string): Promise<StreamableFile> {
    const document = await this.projectService.getDocument(id);

    return new StreamableFile(document.data, {
      type: document.mimeType,
      disposition: `attachment; filename="${encodeURIComponent(document.filename)}"`,
      length: document.size,
    });
  }

  @Delete('images/:id')
  async deleteImage(@Param('id') id: string) {
    await this.projectService.deleteImage(id);
    return { message: 'Изображение удалено' };
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string) {
    await this.projectService.deleteDocument(id);
    return { message: 'Документ удален' };
  }
}
