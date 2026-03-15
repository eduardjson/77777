export interface StockItemDto {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  purchasePrice: number | null;
  estimatePrice: number | null;
  salePrice: number | null;
  discount: number | null;
  createdAt: Date;
  updatedAt: Date;
}
