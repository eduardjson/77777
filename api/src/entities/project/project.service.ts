import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { EstimateItemDto } from './dto/estimate-item.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateProjectDto,
    files?: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.prisma.$transaction(async (prisma) => {
      const project = await prisma.project.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      if (files?.images?.length) {
        await Promise.all(
          files.images.map((file, index) =>
            prisma.projectImage.create({
              data: {
                projectId: project.id,
                data: new Uint8Array(file.buffer),
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                sortOrder: index,
              },
            }),
          ),
        );
      }

      if (files?.documents?.length) {
        await Promise.all(
          files.documents.map((file) =>
            prisma.projectDocument.create({
              data: {
                projectId: project.id,
                data: new Uint8Array(file.buffer),
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
              },
            }),
          ),
        );
      }

      if (dto.estimate) {
        const estimateData =
          typeof dto.estimate === 'string'
            ? JSON.parse(dto.estimate)
            : dto.estimate;
        await this.createEstimate(prisma, project.id, estimateData);
      }

      return project;
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        images: {
          select: { id: true, filename: true, mimeType: true, size: true },
          take: 1,
        },
        _count: {
          select: {
            images: true,
            documents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        documents: {
          select: {
            id: true,
            filename: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
        estimate: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Проект не найден');
    }

    return project;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    files?: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.prisma.$transaction(async (prisma) => {
      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new NotFoundException('Проект не найден');
      }

      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
      });

      if (files?.images?.length) {
        const currentImagesCount = await prisma.projectImage.count({
          where: { projectId: id },
        });

        await Promise.all(
          files.images.map((file, index) =>
            prisma.projectImage.create({
              data: {
                projectId: id,
                data: new Uint8Array(file.buffer),
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                sortOrder: currentImagesCount + index,
              },
            }),
          ),
        );
      }

      if (files?.documents?.length) {
        await Promise.all(
          files.documents.map((file) =>
            prisma.projectDocument.create({
              data: {
                projectId: id,
                data: new Uint8Array(file.buffer),
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
              },
            }),
          ),
        );
      }

      if (dto.estimate) {
        const estimateData =
          typeof dto.estimate === 'string'
            ? JSON.parse(dto.estimate)
            : dto.estimate;

        await prisma.estimate.deleteMany({ where: { projectId: id } });
        await this.createEstimate(prisma, id, estimateData);
      }

      return updatedProject;
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async getImage(id: string) {
    const image = await this.prisma.projectImage.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    return image;
  }

  async getDocument(id: string) {
    const document = await this.prisma.projectDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Документ не найден');
    }

    return document;
  }

  async deleteImage(id: string) {
    return this.prisma.projectImage.delete({ where: { id } });
  }

  async deleteDocument(id: string) {
    return this.prisma.projectDocument.delete({ where: { id } });
  }
  private async createEstimate(
    prisma: any,
    projectId: string,
    estimateDto: any,
  ) {
    const items = estimateDto.items || [];

    // Сначала создаем Estimate
    const estimate = await prisma.estimate.create({
      data: {
        projectId,
        laborCost: estimateDto.laborCost || 0,
      },
    });

    // Затем создаем EstimateItems со ссылкой на estimate
    let totalCost = 0;
    let materialsCost = 0;

    if (items.length > 0) {
      const estimateItems = await Promise.all(
        items.map(async (item: EstimateItemDto) => {
          const total = item.quantity * item.price;
          totalCost += total;

          if (item.costType !== 'LABOR') {
            materialsCost += total;
          }

          return prisma.estimateItem.create({
            data: {
              estimateId: estimate.id, // Важно! Указываем связь с estimate
              productId: item.productId,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit || 'шт',
              price: item.price,
              total: total,
              costType: item.costType || 'MATERIAL',
            },
          });
        }),
      );
    }

    // Обновляем estimate с подсчитанными суммами
    return prisma.estimate.update({
      where: { id: estimate.id },
      data: {
        totalCost,
        materialsCost,
      },
      include: {
        items: true,
      },
    });
  }
}
