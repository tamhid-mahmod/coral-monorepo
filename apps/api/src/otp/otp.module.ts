import { Module } from '@nestjs/common';

import { RedisModule } from '@/redis/redis.module';

import { OtpService } from './otp.service';

// ----------------------------------------------------------------------

@Module({
  imports: [RedisModule],
  providers: [OtpService],
})
export class OtpModule {}
