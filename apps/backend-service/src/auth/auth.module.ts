import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/drizzle/drizzle.module';

import { UserService } from '@/user/user.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// ----------------------------------------------------------------------

@Module({
  imports: [DrizzleModule],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
