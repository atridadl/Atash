import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/server/schema.ts",
  out: "./drizzle/generated",
  driver: "pg",
  breakpoints: true,
  dbCredentials: {
    connectionString: `${process.env.DATABASE_URL}?sslmode=verify-full`,
  },
} satisfies Config;
