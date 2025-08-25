import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { RefreshTokenDto, RefreshTokenResponseDto } from './dto';

// ----------------------------------------------------------------------

export function ApiRefreshTokenDoc() {
  return applyDecorators(
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: 201,
      description: 'Token refresh successfully',
      type: RefreshTokenResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials.' }),
  );
}
