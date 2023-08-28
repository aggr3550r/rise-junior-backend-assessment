import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../enums/user-role.enum';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty()
  @MinLength(8)
  public readonly password: string;

  @IsNotEmpty()
  @IsString()
  public readonly full_name: string;

  @IsOptional()
  @IsEnum(UserRole)
  public role?: UserRole = UserRole.USER;
}
