import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./app/_lib/schema.ts",
  out: "./drizzle/generated",
  driver: "turso",
  breakpoints: true,
  dbCredentials: {
    url: `${process.env.DATABASE_URL}`,
    authToken: `${process.env.DATABASE_AUTH_TOKEN}`,
  },
} satisfies Config;
