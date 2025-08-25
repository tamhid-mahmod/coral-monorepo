import type { DrizzleDB } from '@/drizzle/types/drizzle';

import { eq } from 'drizzle-orm';
import { hash } from 'argon2';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { users } from '@/drizzle/schema/users.schema';
import { DRIZZLE } from '@/drizzle/drizzle.module';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// ----------------------------------------------------------------------

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...user } = createUserDto;
    const hashedPassword = await hash(password);

    const [newUser] = await this.db
      .insert(users)
      .values({ password: hashedPassword, ...user })
      .returning({ insertedId: users.id });

    return newUser;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  async findOne(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const [updatedUser] = await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return updatedUser;
  }
}
