import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';
import { VerifyForgotOtpResponseDto } from './dto';

// ----------------------------------------------------------------------

export function ApiVerifyForgotOtpDoc() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'OTP verified successfully.',
      type: VerifyForgotOtpResponseDto,
    }),
    ApiNotFoundResponse({ description: "Couldn't find your account." }),
  );
}
