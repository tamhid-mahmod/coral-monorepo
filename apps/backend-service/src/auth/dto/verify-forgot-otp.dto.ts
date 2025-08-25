import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

// ----------------------------------------------------------------------

export class VerifyForgotOtpDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  otp: string;
}
