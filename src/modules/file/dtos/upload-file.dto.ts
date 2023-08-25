import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadFileDTO {
  @IsString()
  @IsNotEmpty()
  public readonly file_path: string;

  @IsString()
  @IsOptional()
  public readonly folder_name?: string;

  public readonly filename: string;
}
