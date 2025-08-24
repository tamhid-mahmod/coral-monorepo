import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';

// ----------------------------------------------------------------------
@Module({
  imports: [
    DrizzleModule,
    AuthModule,
    UserModule,
    OtpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
