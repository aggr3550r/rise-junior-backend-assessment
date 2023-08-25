import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../enums/user-role.enum';
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends CreateUserDTO {
  @IsOptional()
  @IsEnum(UserRole)
  public role: UserRole;

  @IsBoolean()
  @IsOptional()
  public is_active: boolean;
}
