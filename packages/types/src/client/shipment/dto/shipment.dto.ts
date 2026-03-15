import { ShipmentStatus } from '../../../shared/enums';

export interface ShipmentDto {
  id: string;
  warehouseId: string;
  objectId: string;
  status: ShipmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
