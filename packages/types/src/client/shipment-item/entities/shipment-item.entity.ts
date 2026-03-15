import { ShipmentInterface } from '../../shipment/entities/shipment.entity';
import { ProductInterface } from '../../product/entities/product.entity';

export interface ShipmentItemInterface {
  id: string;
  shipmentId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  shipment?: ShipmentInterface;
  product?: ProductInterface;
}
