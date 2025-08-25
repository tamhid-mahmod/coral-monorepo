import { applyDecorators } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiResponse,
} from '@nestjs/swagger';

// ----------------------------------------------------------------------

export function ApiVerifyAccountDoc() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Your account has been registered successfully.',
    }),
    ApiConflictResponse({
      description: 'This account has already been verified.',
    }),
    ApiForbiddenResponse({ description: 'Forbidden.' }),
  );
}
