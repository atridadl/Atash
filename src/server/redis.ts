import { Redis } from "@upstash/redis";
import { env } from "~/env.mjs";

export const redis = Redis.fromEnv();

export const setCache = async <T>(key: string, value: T) => {
  try {
    await redis.set(`${env.APP_ENV}_${key}`, value, {
      ex: Number(env.UPSTASH_REDIS_EXPIRY_SECONDS),
    });
    return true;
  } catch {
    return false;
  }
};

export const fetchCache = async <T>(key: string) => {
  try {
    const result = await redis.get(`${env.APP_ENV}_${key}`);
    return result as T;
  } catch {
    return null;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    await redis.del(`${env.APP_ENV}_${key}`);
    return true;
  } catch {
    return false;
  }
};
