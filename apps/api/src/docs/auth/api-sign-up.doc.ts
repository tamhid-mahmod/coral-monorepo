import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse, ApiResponse } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export function ApiSignUpDoc() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OTP sent to email. Please verify your account.',
    }),
    ApiForbiddenResponse({ description: 'Forbidden.' }),
  );
}
