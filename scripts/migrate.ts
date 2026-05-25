import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { pgSslConfig } from "../src/lib/pg-ssl";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional when the environment is already populated.
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: pgSslConfig() });
  const db = drizzle(pool);

  await migrate(db, { migrationsFolder: "./drizzle" });
  await pool.end();

  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
