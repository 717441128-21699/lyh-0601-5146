import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名或邮箱' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  account: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}
