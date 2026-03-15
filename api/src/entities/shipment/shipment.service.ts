import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentStatus } from 'generated/prisma/client';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateShipmentDto): Promise<object> {
    const { warehouseId, objectId, items } = dto;

    await this.prisma.warehouse
      .findUniqueOrThrow({ where: { id: warehouseId } })
      .catch(() => {
        throw new NotFoundException('Склад не найден');
      });

    await this.prisma.object
      .findUniqueOrThrow({ where: { id: objectId } })
      .catch(() => {
        throw new NotFoundException('Объект не найден');
      });

    for (const item of items) {
      const stockItem = await this.prisma.stockItem.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId,
          },
        },
      });

      if (!stockItem || stockItem.quantity < item.quantity) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });
        throw new BadRequestException(
          `Недостаточно товара "${product?.title || item.productId}" на складе. Доступно: ${stockItem?.quantity || 0}`,
        );
      }
    }

    return await this.prisma.$transaction(async (prisma) => {
      const shipment = await prisma.shipment.create({
        data: {
          warehouseId,
          objectId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          warehouse: true,
          object: true,
        },
      });

      for (const item of items) {
        await prisma.stockItem.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return shipment;
    });
  }

  async readOne(id: string): Promise<object> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        object: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Отгрузка не найдена');
    }

    return shipment;
  }

  async readMany(): Promise<object[]> {
    return await this.prisma.shipment.findMany({
      include: {
        warehouse: true,
        object: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, status: ShipmentStatus): Promise<object> {
    await this.readOne(id);

    return await this.prisma.shipment.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!shipment) {
      throw new NotFoundException('Отгрузка не найдена');
    }

    if (shipment.status === 'COMPLETED') {
      await this.prisma.$transaction(async (prisma) => {
        for (const item of shipment.items) {
          await prisma.stockItem.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: shipment.warehouseId,
              },
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }
        await prisma.shipment.delete({ where: { id } });
      });
    } else {
      await this.prisma.shipment.delete({ where: { id } });
    }
  }

  async getShipmentsByObject(objectId: string): Promise<object[]> {
    return await this.prisma.shipment.findMany({
      where: { objectId },
      include: {
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getShipmentsByWarehouse(warehouseId: string): Promise<object[]> {
    return await this.prisma.shipment.findMany({
      where: { warehouseId },
      include: {
        object: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
