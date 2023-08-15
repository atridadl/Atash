import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/server/schema.ts",
  out: "./drizzle/generated",
  driver: "mysql2",
  breakpoints: true,
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
