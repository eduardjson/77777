import { ProductInterface } from '../../product/entities/product.entity';
import { WarehouseInterface } from '../../warehouse/entities/warehouse.entity';

export interface StockItemInterface {
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
  product?: ProductInterface;
  warehouse?: WarehouseInterface;
}
