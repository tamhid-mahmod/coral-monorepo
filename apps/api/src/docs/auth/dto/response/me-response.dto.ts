import { UserResponseDto } from '@/user/dto';
import { ApiProperty } from '@nestjs/swagger';

// ----------------------------------------------------------------------

export class MeResponseDto {
  @ApiProperty({ description: 'User data', type: UserResponseDto })
  user: UserResponseDto;
}
