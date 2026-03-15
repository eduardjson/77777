import { ShipmentStatus } from '@prisma/client';

export interface ShipmentDto {
  id: string;
  warehouseId: string;
  objectId: string;
  status: ShipmentStatus;
  createdAt: Date;
  updatedAt: Date;
}
