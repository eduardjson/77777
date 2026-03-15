import { IsEnum } from 'class-validator';
import { ShipmentStatus } from 'generated/prisma/client';

export class UpdateStatusDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;
}
