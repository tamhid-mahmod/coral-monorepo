import { IsEmail, IsString } from 'class-validator';

// ----------------------------------------------------------------------

export class VerifyForgotOtpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  otp: string;
}
