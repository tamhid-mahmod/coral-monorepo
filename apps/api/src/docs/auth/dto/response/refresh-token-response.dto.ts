import { ApiProperty } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'User id' })
  id: string;

  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;
}
