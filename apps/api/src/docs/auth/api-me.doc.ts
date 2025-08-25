import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { MeResponseDto } from './dto';

// ----------------------------------------------------------------------

export function ApiMeDoc() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      type: MeResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized.',
    }),
  );
}
