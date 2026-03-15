export class PriceListItemDto {
  // Информация о товаре
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  unit: string;

  // Информация о ценах
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;

  // Информация о наличии
  quantity: number;

  // Информация о складе
  warehouseId: string;
  warehouseName: string;
  warehouseAddress?: string;

  // Дата последнего поступления/обновления
  lastUpdated: Date;
  firstArrivalDate: Date; // Дата первого поступления на склад
}

export class PriceListResponseDto {
  items: PriceListItemDto[];
  totalItems: number;
  generatedAt: Date;
}
