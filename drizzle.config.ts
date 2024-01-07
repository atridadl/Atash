import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./app/services/schema.server.ts",
  out: "./drizzle/generated",
  driver: "pg",
  breakpoints: true,
  dbCredentials: {
    connectionString: `${process.env.DATABASE_URL}`,
  },
} satisfies Config;
