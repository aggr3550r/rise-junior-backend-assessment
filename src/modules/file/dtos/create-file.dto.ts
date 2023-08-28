import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreateFileDTO {
  // user chosen image filename without extension
  @IsOptional()
  @IsString()
  filename?: string;

  // path to the file on the host system
  @IsNotEmpty()
  @IsString()
  file_path: string;

  @IsOptional()
  owner?: User;

  @IsOptional()
  @IsNumber()
  @Max(200000000)
  @IsPositive()
  size?: number;
}
