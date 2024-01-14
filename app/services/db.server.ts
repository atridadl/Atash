import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.server";
import "dotenv/config";

const queryClient = postgres(process.env.DATABASE_URL!, {
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});
export const db = drizzle(queryClient, { schema });
