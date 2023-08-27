import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../enums/user-role.enum';

export class UpdateUserDTO {
  @IsOptional()
  @IsEnum(UserRole)
  public role?: UserRole;

  @IsOptional()
  @IsString()
  public full_name?: string;

  @IsBoolean()
  @IsOptional()
  public is_active?: boolean;
}
