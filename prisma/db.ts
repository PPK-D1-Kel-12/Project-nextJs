import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './schema.d';
import contractJson from './schema.json' with { type: 'json' };

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof postgres<Contract>>;
};

export const db =
  globalForDb.db ??
  (process.env['DATABASE_URL']
    ? postgres<Contract>({
        contractJson,
        url: process.env['DATABASE_URL'],
      })
    : ({} as any));

if (process.env.NODE_ENV !== 'production' && db) globalForDb.db = db;
