import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    UPSTASH_REDIS_EXPIRY_SECONDS: z.string(),
    UPSTASH_RATELIMIT_REQUESTS: z.string(),
    UPSTASH_RATELIMIT_SECONDS: z.string(),
    ABLY_PRIVATE_KEY: z.string(),
    APP_ENV: z.string(),
    UNKEY_ROOT_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_ABLY_PUBLIC_KEY: z.string(),
    NEXT_PUBLIC_APP_ENV: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ABLY_PUBLIC_KEY: process.env.NEXT_PUBLIC_ABLY_PUBLIC_KEY,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
});
