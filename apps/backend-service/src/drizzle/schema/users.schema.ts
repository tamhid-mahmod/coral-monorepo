import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ----------------------------------------------------------------------

export const users = pgTable('user', {
  id: uuid('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }).defaultNow(),
  password: text('password'),
  lastPasswordChanged: timestamp('lastPasswordChanged', { mode: 'date' }),
  image: text('image'),
});
