import { ProductImageInterface } from '../../product-image/entities/product-image.entity';
import { ShipmentItemInterface } from '../../shipment-item/entities/shipment-item.entity';
import { StockItemInterface } from '../../stock-item/entities/stock-item.entity';

export interface ProductInterface {
  id: string;
  title: string;
  description: string;
  category: string;
  manufacturer: string;
  imageUrl: string;
  unit: string;
  images?: ProductImageInterface[];
  shipmentItems?: ShipmentItemInterface[];
  stockItems?: StockItemInterface[];
}
