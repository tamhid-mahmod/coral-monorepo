import { ApiProperty } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}
