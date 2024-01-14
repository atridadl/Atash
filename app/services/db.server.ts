import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "./schema.server";
import "dotenv/config";

const queryClient = postgres(process.env.DATABASE_URL!, {keep_alive: 10000});
export const db = drizzle(queryClient, { schema });
