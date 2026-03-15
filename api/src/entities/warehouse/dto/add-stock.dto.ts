import {
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  Min as MinNumber,
  Max,
} from 'class-validator';

export class AddStockDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsOptional()
  @MinNumber(0)
  purchasePrice?: number;

  @IsNumber()
  @IsOptional()
  @MinNumber(0)
  estimatePrice?: number;

  @IsNumber()
  @IsOptional()
  @MinNumber(0)
  salePrice?: number;

  @IsNumber()
  @IsOptional()
  @MinNumber(0)
  @Max(100)
  discount?: number;
}
