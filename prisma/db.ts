import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './schema.d';
import contractJson from './schema.json' with { type: 'json' };

const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof postgres<Contract>>;
};

const rawDbUrl = process.env['DATABASE_URL'];
const isValidDbUrl = Boolean(
  rawDbUrl &&
  !rawDbUrl.includes('[PROJECT-REF]') &&
  !rawDbUrl.includes('[YOUR-PASSWORD]') &&
  !rawDbUrl.includes('[REGION]')
);

export const db =
  globalForDb.db ??
  (isValidDbUrl
    ? postgres<Contract>({
        contractJson,
        url: rawDbUrl!,
      })
    : ({} as any));

if (process.env.NODE_ENV !== 'production' && db) globalForDb.db = db;
