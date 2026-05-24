import { defineConfig } from "drizzle-kit";

// Load .env for CLI-driven commands (generate/push/studio). The app itself
// relies on the framework's built-in environment loading.
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional when the environment is already populated.
}

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
