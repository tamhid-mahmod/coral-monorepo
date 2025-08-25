import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/drizzle/drizzle.module';

import { UserService } from './user.service';
import { UserController } from './user.controller';

// ----------------------------------------------------------------------

@Module({
  imports: [DrizzleModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
