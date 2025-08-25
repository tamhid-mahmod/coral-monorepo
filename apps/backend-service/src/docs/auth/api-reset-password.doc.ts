import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';

// ----------------------------------------------------------------------

export function ApiResetPasswordDoc() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Password reset successfully.',
    }),
    ApiForbiddenResponse({ description: 'Forbidden.' }),
    ApiNotFoundResponse({ description: 'Account with this email not exists.' }),
  );
}
