import { ShipmentInterface } from '../../shipment/entities/shipment.entity';

export interface ObjectInterface {
  id: string;
  name: string;
  address: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  shipments?: ShipmentInterface[];
}
