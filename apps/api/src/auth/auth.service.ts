import type { AuthJwtPayload } from '@/auth/types/auth-jwtPayload';
import type { ResetTokenPayload } from '@/auth/types/reset-tokenPayload';

import * as crypto from 'crypto';
import Redis from 'ioredis';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { REDIS } from '@/redis/redis.module';

import { OtpService } from '@/otp/otp.service';

import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto';

import refreshConfig from './config/refresh.config';
import {
  VerifyUserDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  VerifyForgotOtpDto,
} from './dto';

// ----------------------------------------------------------------------

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(refreshConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshConfig>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    await this.otpService.checkRateLimit(createUserDto.email);
    await this.otpService.trackFailedOtpAttempt(createUserDto.email);
    await this.otpService.sendOtpViaEmail(
      createUserDto.name,
      createUserDto.email,
      'verification code',
      'email-verification',
    );

    return { message: 'OTP sent to email. Please verify your account.' };
  }

  async verifyAccount(verifyUserDto: VerifyUserDto) {
    const user = await this.userService.findByEmail(verifyUserDto.email);

    if (user && user.emailVerified) {
      throw new ConflictException('This account has already been verified.');
    }

    await this.otpService.verifyOtp(verifyUserDto.email, verifyUserDto.otp);
    await this.userService.create(verifyUserDto);

    return { message: 'Your account has been registered successfully.' };
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const isPasswordMatched = await verify(user.password!, password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return { id: user.id, name: user.name };
  }

  async login(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    return {
      id: userId,
      name,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async validateRefreshToken(userId: string) {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  async refreshToken(userId: string, name: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    return {
      id: userId,
      name,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException("Couldn't find your account.");
    }

    await this.otpService.checkRateLimit(forgotPasswordDto.email);
    await this.otpService.trackFailedOtpAttempt(forgotPasswordDto.email);
    await this.otpService.sendOtpViaEmail(
      user.name,
      forgotPasswordDto.email,
      'reset password code',
      'forgot-password',
    );

    return {
      message: 'OTP sent to email. Please verify this is your account.',
    };
  }

  async verifyForgotOtp(verifyForgotOtp: VerifyForgotOtpDto) {
    const user = await this.userService.findByEmail(verifyForgotOtp.email);

    if (!user) {
      throw new NotFoundException("Couldn't find your account.");
    }

    await this.otpService.verifyOtp(verifyForgotOtp.email, verifyForgotOtp.otp);

    const resetSessionToken = crypto.randomBytes(32).toString('hex');
    const resetSessionExpiry = 15; // 15 minutes
    const resetSessionKey = `pwd_reset:session:${resetSessionToken}`;

    await this.redis.setex(
      resetSessionKey,
      resetSessionExpiry * 60,
      JSON.stringify({
        email: verifyForgotOtp.email,
        verifiedAt: new Date().toISOString(),
      }),
    );

    return {
      message: 'OTP verified successfully.',
      resetToken: resetSessionToken,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetSessionKey = `pwd_reset:session:${resetPasswordDto.resetToken}`;
    const resetSessionData = await this.redis.get(resetSessionKey);

    if (!resetSessionData) {
      throw new ForbiddenException('Invalid or expired reset session!');
    }

    const { email, verifiedAt } = JSON.parse(
      resetSessionData,
    ) as ResetTokenPayload;

    // Check if session is still valid
    const expiresAt = new Date(verifiedAt).getTime() + 15 * 60 * 1000;

    if (Date.now() > expiresAt) {
      await this.redis.del(resetSessionKey);
      throw new ForbiddenException('Reset session has expired.');
    }

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Account with this email not exists.');
    }

    // Check if new password is different from current
    const isSameAsCurrent = await verify(
      user.password!,
      resetPasswordDto.newPassword,
    );

    if (isSameAsCurrent) {
      throw new ForbiddenException(
        'New password must be different from current password.',
      );
    }

    const hashedPassword = await hash(resetPasswordDto.newPassword);
    await this.userService.update(user.id, {
      password: hashedPassword,
      lastPasswordChanged: new Date(),
    });

    // Invalidate all existing sessions

    // Remove the reset session
    await this.redis.del(resetSessionKey);

    // Send confirmation email

    return { message: 'Password reset successfully.' };
  }
}
