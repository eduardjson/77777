import { ShipmentStatus } from '@prisma/client';
import { WarehouseInterface } from '../../warehouse/entities/warehouse.entity';
import { ObjectInterface } from '../../object/entities/object.entity';
import { ShipmentItemInterface } from '../../shipment-item/entities/shipment-item.entity';

export interface ShipmentInterface {
  id: string;
  warehouseId: string;
  objectId: string;
  status: ShipmentStatus;
  createdAt: Date;
  updatedAt: Date;
  warehouse?: WarehouseInterface;
  object?: ObjectInterface;
  items?: ShipmentItemInterface[];
}
