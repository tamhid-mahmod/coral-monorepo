import * as crypto from 'crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { redis } from '@/common/lib/redis';
import { sendEmail } from '@/common/lib/resend';

import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';

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
}
