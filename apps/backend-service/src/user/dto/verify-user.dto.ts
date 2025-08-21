import { IsString } from 'class-validator';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

// ----------------------------------------------------------------------

export class VerifyUserDto extends IntersectionType(CreateUserDto) {
  @IsString()
  @ApiProperty()
  otp: string;
}
