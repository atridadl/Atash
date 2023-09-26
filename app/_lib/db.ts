import { neon } from "@neondatabase/serverless";
import * as schema from "app/_lib/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "env.mjs";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
