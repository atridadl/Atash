import { Redis } from "ioredis";
import { env } from "env.mjs";

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      family: 6,
    })
  : null;

export const setCache = async <T>(key: string, value: T) => {
  try {
    await redis?.set(`${env.APP_ENV}_${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const fetchCache = async <T>(key: string) => {
  try {
    const result = (await redis?.get(`${env.APP_ENV}_${key}`)) as string;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    await redis?.del(`${env.APP_ENV}_${key}`);
    return true;
  } catch {
    return false;
  }
};
