import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { FileFlag } from '../../../enums/file-flag.enum';
import { CreateFileDTO } from './create-file.dto';

export class UpdateFileDTO extends CreateFileDTO {
  @IsOptional()
  @IsEnum(FileFlag)
  file_flag: FileFlag;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  admin_review_count: number;

  @IsOptional()
  @IsBoolean()
  is_active: boolean = true;

  @IsOptional()
  @IsString()
  file_download_link: string;
}
