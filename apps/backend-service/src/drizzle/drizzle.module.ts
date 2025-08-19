import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as schema from './schema';

// ----------------------------------------------------------------------

export const DRIZZLE = Symbol('drizzle-connection'); // unique token for dynamic provider

// ----------------------------------------------------------------------

@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseURL = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString: databaseURL,
          ssl: true,
        });

        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
