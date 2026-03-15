import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EstimateDto } from './estimate.dto';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  images?: Express.Multer.File[];

  @IsArray()
  @IsOptional()
  documents?: Express.Multer.File[];

  @ValidateNested()
  @IsOptional()
  @Type(() => EstimateDto)
  estimate?: EstimateDto;
}
