import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateUserDto } from '@/user/dto/create-user.dto';
import { VerifyUserDto } from '@/user/dto/verify-user.dto';

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

  @Post('/verify-account')
  @ApiResponse({
    status: 201,
    description: 'Your account has been registered successfully.',
  })
  @ApiConflictResponse({
    description: 'This account has already been verified.',
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  verifyAccount(@Body() verifyUserDto: VerifyUserDto) {
    return this.authService.verifyAccount(verifyUserDto);
  }
}
