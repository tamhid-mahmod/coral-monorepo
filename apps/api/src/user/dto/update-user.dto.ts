import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsDate } from 'class-validator';

// ----------------------------------------------------------------------
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastPasswordChanged?: Date;
}
