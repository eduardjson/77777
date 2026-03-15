import { IsString, IsOptional } from "class-validator";

export class CreateObjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
