import { Type } from "class-transformer";
import {
  ValidateNested,
  IsArray,
  IsString,
  IsInt,
  Min,
  ArrayMinSize,
} from "class-validator";

class ShipmentItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateShipmentDto {
  @IsString()
  warehouseId: string;

  @IsString()
  objectId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  items: ShipmentItemDto[];
}
