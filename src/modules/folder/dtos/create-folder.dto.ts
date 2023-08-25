import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDTO {
  @IsNotEmpty()
  @IsString()
  folder_name: string;
}
