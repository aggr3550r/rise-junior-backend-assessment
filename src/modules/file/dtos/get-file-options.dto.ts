import { IsOptional } from 'class-validator';
import { PageOptionsDTO } from '../../../paging/page-option.dto';

export class GetFileOptionsPageDTO extends PageOptionsDTO {
  @IsOptional()
  customKey?: string;

  @IsOptional()
  customValue?: string | number;
}
