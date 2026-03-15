import { StockItemInterface } from '../../stock-item/entities/stock-item.entity';
import { ShipmentInterface } from '../../shipment/entities/shipment.entity';

export interface WarehouseInterface {
  id: string;
  name: string;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
  stockItems?: StockItemInterface[];
  shipments?: ShipmentInterface[];
}
