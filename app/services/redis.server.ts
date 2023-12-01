import Redis from "ioredis";

export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      family: 6,
    })
  : null;

export const setCache = async <T>(key: string, value: T) => {
  try {
    await redis?.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const fetchCache = async <T>(key: string) => {
  try {
    const result = (await redis?.get(key)) as string;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    await redis?.del(key);
    return true;
  } catch {
    return false;
  }
};
