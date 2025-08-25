import type Redis from 'ioredis';

import * as crypto from 'crypto';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';

import { REDIS } from '@/redis/redis.module';

import { sendEmail } from '@/common/lib/resend';

// ----------------------------------------------------------------------

@Injectable()
export class OtpService {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async checkRateLimit(email: string): Promise<void> {
    if (await this.redis.get(`otp_lock:${email}`)) {
      throw new ForbiddenException(
        'Account locked due to multiple failed attepts! Try again after 30 minutes.',
      );
    }

    if (await this.redis.get(`otp_spam_lock:${email}`)) {
      throw new ForbiddenException(
        'Too many OTP requests! Please wait 1hour before requesting again.',
      );
    }

    if (await this.redis.get(`otp_cooldown:${email}`)) {
      throw new ForbiddenException(
        'Please wait 1minute before requesting a new OTP.',
      );
    }
  }

  async trackFailedOtpAttempt(email: string): Promise<void> {
    const otpRequestKey = `otp_request_count:${email}`;
    const otpRequests = parseInt((await this.redis.get(otpRequestKey)) || '0');

    if (otpRequests >= 5) {
      await this.redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); // Lock for 1hour

      throw new ForbiddenException(
        'Too many OTP requests! Please wait 1hour before requesting again.',
      );
    }

    await this.redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600); // Track requests for 1hour
  }

  async sendOtpViaEmail(
    name: string,
    email: string,
    subject: string,
    template: string,
  ): Promise<void> {
    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

    await sendEmail(email, `${otp} is your ${subject}`, template, {
      userName: name,
      appName: 'Coral',
      otp,
      supportEmail: 'support@coral.com',
    });

    await this.redis.set(`otp:${email}`, otp, 'EX', 600); // 10 minutes validity
    await this.redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
  }

  async verifyOtp(email: string, otp: string): Promise<void> {
    const storedOtp = await this.redis.get(`otp:${email}`);

    if (!storedOtp) {
      throw new BadRequestException('OTP is invalid or has expired.');
    }

    const faliedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(
      (await this.redis.get(faliedAttemptsKey)) || '0',
    );

    if (storedOtp !== otp) {
      if (failedAttempts >= 5) {
        await this.redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800); // Lock for 30 minutes
        await this.redis.del(`otp:${email}`, faliedAttemptsKey);

        throw new ForbiddenException(
          'Too many failed attempts. Your account is locked for 30 minutes.',
        );
      }
      await this.redis.set(faliedAttemptsKey, failedAttempts + 1, 'EX', 300);

      throw new BadRequestException('Incorrect OTP!');
    }

    await this.redis.del(`otp:${email}`, faliedAttemptsKey);
  }
}
