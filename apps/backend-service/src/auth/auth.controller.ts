import { ApiForbiddenResponse, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateUserDto } from '@/user/dto/create-user.dto';

import { AuthService } from './auth.service';

// ----------------------------------------------------------------------

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'OTP sent to email. Please verify your account.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }
}
