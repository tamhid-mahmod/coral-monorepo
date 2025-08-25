import Redis from 'ioredis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ----------------------------------------------------------------------

export const REDIS = Symbol('redis'); // unique token for dynamic provider

// ----------------------------------------------------------------------

@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisDatabaseURL = configService.get<string>(
          'REDIS_DATABASE_URL',
        ) as string;

        return new Redis(redisDatabaseURL);
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
