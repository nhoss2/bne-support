import type { Config } from 'drizzle-kit';

export default {
  schema: './api/src/schema.ts',
  out: './api/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db',
  },
} satisfies Config;