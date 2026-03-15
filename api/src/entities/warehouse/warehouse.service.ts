import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { AddStockDto } from './dto/add-stock.dto';
import {
  PriceListItemDto,
  PriceListResponseDto,
} from './dto/price-list-response.dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWarehouseDto): Promise<string> {
    const warehouse = await this.prisma.warehouse.create({ data: dto });
    return warehouse.id;
  }

  async readOne(id: string): Promise<object> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        stockItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найден');
    }

    return warehouse;
  }

  async readMany(): Promise<object[]> {
    return await this.prisma.warehouse.findMany({
      include: {
        stockItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: Partial<CreateWarehouseDto>): Promise<object> {
    await this.readOne(id);

    return await this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.readOne(id);
    await this.prisma.warehouse.delete({ where: { id } });
  }

  async addStock(warehouseId: string, dto: AddStockDto): Promise<object> {
    const {
      productId,
      quantity,
      purchasePrice,
      estimatePrice,
      salePrice,
      discount,
    } = dto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    await this.readOne(warehouseId);

    // Проверяем, существует ли уже запись остатка
    const existingStock = await this.prisma.stockItem.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    let stockItem;

    if (existingStock) {
      // Обновляем существующую запись
      stockItem = await this.prisma.stockItem.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
        data: {
          quantity: {
            increment: quantity,
          },
          // Обновляем цены только если они переданы
          ...(purchasePrice !== undefined && { purchasePrice }),
          ...(estimatePrice !== undefined && { estimatePrice }),
          ...(salePrice !== undefined && { salePrice }),
          ...(discount !== undefined && { discount }),
        },
        include: {
          product: true,
          warehouse: true,
        },
      });
    } else {
      // Создаем новую запись
      stockItem = await this.prisma.stockItem.create({
        data: {
          productId,
          warehouseId,
          quantity,
          purchasePrice,
          estimatePrice,
          salePrice,
          discount,
        },
        include: {
          product: true,
          warehouse: true,
        },
      });
    }

    return stockItem;
  }

  async getStock(warehouseId: string, productId?: string): Promise<object[]> {
    const where: any = { warehouseId };

    if (productId) {
      where.productId = productId;
    }

    return await this.prisma.stockItem.findMany({
      where,
      include: {
        product: true,
      },
    });
  }
  async getAllPriceLists(): Promise<PriceListResponseDto> {
    // Получаем все остатки со всех складов с информацией о товарах и складах
    const stockItems = await this.prisma.stockItem.findMany({
      where: {
        quantity: {
          gt: 0, // Только товары в наличии
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { product: { category: 'asc' } },
        { product: { manufacturer: 'asc' } },
      ],
    });

    // Для каждого товара нам нужно узнать дату первого поступления
    const items: PriceListItemDto[] = await Promise.all(
      stockItems.map(async (item) => {
        // Находим самую раннюю запись этого товара на этом складе
        const firstArrival = await this.prisma.stockItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            createdAt: true,
          },
        });

        return {
          productId: item.productId,
          productName: item.product.title,
          manufacturer: item.product.manufacturer,
          category: item.product.category,
          unit: 'шт', // Используем значение по умолчанию
          purchasePrice: item.purchasePrice || undefined,
          estimatePrice: item.estimatePrice || undefined,
          salePrice: item.salePrice || undefined,
          discount: item.discount || 0,
          quantity: item.quantity,
          warehouseId: item.warehouseId,
          warehouseName: item.warehouse.name,
          warehouseAddress: item.warehouse.address || undefined,
          lastUpdated: item.updatedAt,
          firstArrivalDate: firstArrival?.createdAt || item.createdAt,
        };
      }),
    );

    return {
      items,
      totalItems: items.length,
      generatedAt: new Date(),
    };
  }

  async getWarehousePriceList(
    warehouseId: string,
  ): Promise<PriceListResponseDto> {
    // Проверяем существование склада
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найден');
    }

    // Получаем остатки только для конкретного склада
    const stockItems = await this.prisma.stockItem.findMany({
      where: {
        warehouseId,
        quantity: {
          gt: 0, // Только товары в наличии
        },
      },
      include: {
        product: true,
      },
      orderBy: [
        { product: { category: 'asc' } },
        { product: { manufacturer: 'asc' } },
        { product: { title: 'asc' } },
      ],
    });

    const items: PriceListItemDto[] = await Promise.all(
      stockItems.map(async (item) => {
        // Находим самую раннюю запись этого товара на этом складе
        const firstArrival = await this.prisma.stockItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            createdAt: true,
          },
        });

        return {
          productId: item.productId,
          productName: item.product.title,
          manufacturer: item.product.manufacturer,
          category: item.product.category,
          unit: 'шт', // Используем значение по умолчанию
          purchasePrice: item.purchasePrice || undefined,
          estimatePrice: item.estimatePrice || undefined,
          salePrice: item.salePrice || undefined,
          discount: item.discount || 0,
          quantity: item.quantity,
          warehouseId: item.warehouseId,
          warehouseName: warehouse.name,
          warehouseAddress: warehouse.address || undefined,
          lastUpdated: item.updatedAt,
          firstArrivalDate: firstArrival?.createdAt || item.createdAt,
        };
      }),
    );

    return {
      items,
      totalItems: items.length,
      generatedAt: new Date(),
    };
  }

  // Дополнительный метод для получения прайс-листа с фильтрацией
  async getFilteredPriceLists(
    warehouseId?: string,
    category?: string,
    manufacturer?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<PriceListResponseDto> {
    const where: any = {
      quantity: { gt: 0 },
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const stockItems = await this.prisma.stockItem.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
    });

    // Фильтруем по категории, производителю и ценам
    let filteredItems = stockItems;

    if (category) {
      filteredItems = filteredItems.filter((item) =>
        item.product.category.toLowerCase().includes(category.toLowerCase()),
      );
    }

    if (manufacturer) {
      filteredItems = filteredItems.filter((item) =>
        item.product.manufacturer
          .toLowerCase()
          .includes(manufacturer.toLowerCase()),
      );
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filteredItems = filteredItems.filter((item) => {
        const price =
          item.salePrice || item.estimatePrice || item.purchasePrice || 0;
        if (minPrice !== undefined && maxPrice !== undefined) {
          return price >= minPrice && price <= maxPrice;
        } else if (minPrice !== undefined) {
          return price >= minPrice;
        } else if (maxPrice !== undefined) {
          return price <= maxPrice;
        }
        return true;
      });
    }

    const items: PriceListItemDto[] = await Promise.all(
      filteredItems.map(async (item) => {
        const firstArrival = await this.prisma.stockItem.findFirst({
          where: {
            productId: item.productId,
            warehouseId: item.warehouseId,
          },
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            createdAt: true,
          },
        });

        return {
          productId: item.productId,
          productName: item.product.title,
          manufacturer: item.product.manufacturer,
          category: item.product.category,
          unit: item.product.unit || 'шт',

          purchasePrice: item.purchasePrice || undefined,
          estimatePrice: item.estimatePrice || undefined,
          salePrice: item.salePrice || undefined,
          discount: item.discount || 0,

          quantity: item.quantity,

          warehouseId: item.warehouseId,
          warehouseName: item.warehouse.name,
          warehouseAddress: item.warehouse.address || undefined,

          lastUpdated: item.updatedAt,
          firstArrivalDate: firstArrival?.createdAt || item.createdAt,
        };
      }),
    );

    return {
      items,
      totalItems: items.length,
      generatedAt: new Date(),
    };
  }
}
