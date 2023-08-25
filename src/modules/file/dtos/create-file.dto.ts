import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SupportedExtension } from '../../../enums/supported-extension.enum';
import { User } from '../../user/entities/user.model';
import { Folder } from '../../folder/entities/folder.model';

export class CreateFileDTO {
  // user chosen image filename without extension
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNumber()
  @IsOptional()
  size: number;

  // path to the file on the host system
  @IsNotEmpty()
  @IsString()
  file_path: string;

  @IsNotEmpty()
  @IsEnum(SupportedExtension)
  extension: SupportedExtension;

  @IsOptional()
  owner: User;

  @IsOptional()
  folder: Folder;
}
