import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PageOptionsDTO } from '../../../paging/page-option.dto';

export class GetFileOptionsPageDTO extends PageOptionsDTO {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  fileId: string;

  @IsOptional()
  customKey: string;

  @IsOptional()
  customValue: string | number;
}
