import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiResponse } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export function ApiForgotPasswordDoc() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'OTP sent to email. Please verify this is your account.',
    }),
    ApiNotFoundResponse({ description: "Couldn't find your account." }),
  );
}
