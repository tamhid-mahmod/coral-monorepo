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

import {
  ApiForgotPasswordDoc,
  ApiLoginDoc,
  ApiMeDoc,
  ApiRefreshTokenDoc,
  ApiResetPasswordDoc,
  ApiSignUpDoc,
  ApiVerifyAccountDoc,
  ApiVerifyForgotOtpDoc,
} from '@/docs/auth';

import { AuthService } from './auth.service';
import { ActiveUser, type ActiveUserType } from './decorators';
import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from './guards';
import {
  ResetPasswordDto,
  ForgotPasswordDto,
  VerifyForgotOtpDto,
  VerifyUserDto,
} from './dto';

// ----------------------------------------------------------------------

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  @ApiSignUpDoc()
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Post('/verify-account')
  @ApiVerifyAccountDoc()
  verifyAccount(@Body() verifyUserDto: VerifyUserDto) {
    return this.authService.verifyAccount(verifyUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiLoginDoc()
  login(@Request() req: Express.Request) {
    return this.authService.login(req.user.id, req.user.name);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('/refresh-token')
  @ApiRefreshTokenDoc()
  refreshToken(@Request() req: Express.Request) {
    return this.authService.refreshToken(req.user.id, req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  @ApiMeDoc()
  me(@ActiveUser() user: ActiveUserType) {
    return { user };
  }

  @Post('/forgot-password')
  @ApiForgotPasswordDoc()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/verify-forgot-otp')
  @ApiVerifyForgotOtpDoc()
  async verifyForgotOtp(@Body() verifyForgotOtp: VerifyForgotOtpDto) {
    return await this.authService.verifyForgotOtp(verifyForgotOtp);
  }

  @Post('/reset-password')
  @ApiResetPasswordDoc()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
