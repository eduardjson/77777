import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma";
import { CreateObjectDto } from "./dto/create-object.dto";

@Injectable()
export class ObjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateObjectDto): Promise<string> {
    const object = await this.prisma.object.create({ data: dto });
    return object.id;
  }

  async readOne(id: string): Promise<object> {
    const object = await this.prisma.object.findUnique({
      where: { id },
      include: {
        shipments: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            warehouse: true,
          },
        },
      },
    });

    if (!object) {
      throw new NotFoundException("Объект не найден");
    }

    return object;
  }

  async readMany(): Promise<object[]> {
    return await this.prisma.object.findMany({
      include: {
        shipments: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, dto: Partial<CreateObjectDto>): Promise<object> {
    await this.readOne(id);

    return await this.prisma.object.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.readOne(id);
    await this.prisma.object.delete({ where: { id } });
  }
}
