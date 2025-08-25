import { ApiProperty } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export class VerifyForgotOtpResponseDto {
  @ApiProperty({ description: 'Base64 reset token valid for 15 minutes' })
  resetToken: string;
}
