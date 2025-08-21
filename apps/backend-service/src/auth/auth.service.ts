import * as crypto from 'crypto';
import {
  Injectable,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { redis } from '@/common/lib/redis';
import { sendEmail } from '@/common/lib/resend';

import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { VerifyUserDto } from '@/user/dto/verify-user.dto';

// ----------------------------------------------------------------------

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    await this.checkOtpRestrictions(createUserDto.email);
    await this.trackOtpRequests(createUserDto.email);
    await this.sendOtp(
      createUserDto.name,
      createUserDto.email,
      'email-verification',
    );

    return { message: 'OTP sent to email. Please verify your account.' };
  }

  async checkOtpRestrictions(email: string) {
    if (await redis.get(`otp_lock:${email}`)) {
      throw new ForbiddenException(
        'Account locked due to multiple failed attepts! Try again after 30 minutes.',
      );
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
      throw new ForbiddenException(
        'Too many OTP requests! Please wait 1hour before requesting again.',
      );
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
      throw new ForbiddenException(
        'Please wait 1minute before requesting a new OTP.',
      );
    }
  }

  async trackOtpRequests(email: string) {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

    if (otpRequests >= 3) {
      await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // Lock for 1hour

      throw new ForbiddenException(
        'Too many OTP requests! Please wait 1hour before requesting again.',
      );
    }

    await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600); // Track requests for 1hour
  }

  async sendOtp(name: string, email: string, template: string) {
    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

    await sendEmail(email, `Email verification code: ${otp}`, template, {
      userName: name,
      appName: 'Coral',
      otp,
      supportEmail: 'support@coral.com',
    });
    await redis.set(`otp:${email}`, otp, 'EX', 600); // 10 minutes validity
    await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
  }

  async verifyAccount(verifyUserDto: VerifyUserDto) {
    const user = await this.userService.findByEmail(verifyUserDto.email);

    if (user && user.emailVerified) {
      throw new ConflictException('This account has already been verified.');
    }

    await this.verifyOtp(verifyUserDto.email, verifyUserDto.otp);
    await this.userService.create(verifyUserDto);

    return { message: 'Your account has been registered successfully.' };
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp) {
      throw new BadRequestException('OTP is invalid or has expired.');
    }

    const faliedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await redis.get(faliedAttemptsKey)) || '0',
    );

    if (storedOtp !== otp) {
      if (failedAttempts >= 3) {
        await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800); // Lock for 30 minutes
        await redis.del(`otp:${email}`, faliedAttemptsKey);

        throw new ForbiddenException(
          'Too many failed attempts. Your account is locked for 30 minutes.',
        );
      }
      await redis.set(faliedAttemptsKey, failedAttempts + 1, 'EX', 300);

      throw new BadRequestException('Incorrect OTP!');
    }

    await redis.del(`otp:${email}`, faliedAttemptsKey);
  }
}
