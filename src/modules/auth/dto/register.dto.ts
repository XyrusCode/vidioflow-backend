import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}
