import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  resetToken: string;

  @IsString()
  @ApiProperty()
  newPassword: string;
}
