import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { CostType } from './cost-type.enum';

export class EstimateItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(CostType)
  @IsOptional()
  costType?: CostType;
}
