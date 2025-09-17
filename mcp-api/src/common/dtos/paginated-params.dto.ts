import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginatedParamsDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  perPage: number;

  @IsOptional()
  @IsString()
  orderDirection?: 'asc' | 'desc';
}
