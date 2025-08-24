import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '@/user/dto/create-user.dto';
import { VerifyUserDto } from '@/user/dto/verify-user.dto';

import { ActiveUser } from './decorators/active-user.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyForgotOtpDto } from './dto/verify-forgot-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  login(@Request() req) {
    return this.authService.login(req.user.id, req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  getAll(@Request() req) {
    return `Now you can access this protected API. ${req.user.id}`;
  }

  @UseGuards(RefreshAuthGuard)
  @Post('/refresh-token')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@ActiveUser() user) {
    return { user };
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/verify-forgot-otp')
  async verifyForgotOtp(@Body() verifyForgotOtp: VerifyForgotOtpDto) {
    return await this.authService.verifyForgotOtp(verifyForgotOtp);
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
