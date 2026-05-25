import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { pgSslConfig } from "./pg-ssl";
import * as schema from "./schema";

// Reuse a single pool across hot reloads in development so we don't exhaust
// Postgres connections.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: pgSslConfig(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
