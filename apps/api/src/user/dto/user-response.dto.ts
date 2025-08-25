import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

// ----------------------------------------------------------------------

export class UserResponseDto {
  @IsString()
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string;

  @IsString()
  @ApiProperty({ description: 'Full name of the user' })
  name: string;

  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'Email address of the user' })
  email: string;
}
