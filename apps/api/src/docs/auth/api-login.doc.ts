import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { LoginDto, LoginResponseDto } from './dto';

// ----------------------------------------------------------------------

export function ApiLoginDoc() {
  return applyDecorators(
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'User logged in successfully',
      type: LoginResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials.' }),
  );
}
