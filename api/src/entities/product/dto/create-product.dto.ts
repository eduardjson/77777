import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  manufacturer: string;

  @IsString()
  imageUrl: string;

  @IsUUID()
  @IsOptional()
  priceListId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
