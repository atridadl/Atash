import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DATABASE_AUTH_TOKEN: z.string(),
    REDIS_URL: z.string().url().optional(),
    REDIS_EXPIRY_SECONDS: z.string().optional(),
    ABLY_API_KEY: z.string(),
    APP_ENV: z.string(),
    UNKEY_ROOT_KEY: z.string(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
    ROOT_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_ENV: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  },
});
