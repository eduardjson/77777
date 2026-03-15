import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EstimateItemDto } from './estimate-item.dto';

export class EstimateDto {
  @IsNumber()
  @IsOptional()
  laborCost?: number;

  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items: EstimateItemDto[];
}
