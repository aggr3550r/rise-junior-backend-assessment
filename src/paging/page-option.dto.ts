import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PageOptionsDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take?: number = 20;

  @IsOptional()
  search_term?: string;

  @IsOptional()
  sort_by?: string;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
