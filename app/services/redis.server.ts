import Redis from "ioredis";
import "dotenv/config";

let cache: Redis | null = null;
let pub: Redis | null = null;
let sub: Redis | null = null;

declare global {
  var __cache: Redis | null;
  var __pub: Redis | null;
  var __sub: Redis | null;
}

if (process.env.NODE_ENV === "production") {
  cache = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        family: 6,
      })
    : null;
} else {
  if (!global.__cache) {
    global.__cache = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, {
          family: 6,
        })
      : null;
  }
  cache = global.__cache;
}

if (process.env.NODE_ENV === "production") {
  pub = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        family: 6,
      })
    : null;
} else {
  if (!global.__pub) {
    global.__pub = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, {
          family: 6,
        })
      : null;
  }
  pub = global.__pub;
}

if (process.env.NODE_ENV === "production") {
  sub = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, {
        family: 6,
      })
    : null;
} else {
  if (!global.__sub) {
    global.__sub = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, {
          family: 6,
        })
      : null;
  }
  sub = global.__sub;
}

export const publishToChannel = async (channel: string, message: string) => {
  await pub?.publish(channel, JSON.stringify(message));
};

export const subscribeToChannel = async (
  channel: string,
  callback: Function
) => {
  await sub?.subscribe(channel, (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    } else {
      console.log(
        `Subscribed successfully! This client is currently subscribed to ${count} channels.`
      );
    }
  });

  sub?.on("message", (channel, message) => {
    console.log(`Received ${message} from ${channel}`);
    callback(message);
  });
};

export const unsubscribeToChannel = (channel: string) => {
  console.log(`Unsubscribed successfully from ${channel}!`);
  Promise.resolve([sub?.unsubscribe(channel)]);
};

export const setCache = async <T>(key: string, value: T, prefix?: string) => {
  try {
    await cache?.set(prefix ? `${prefix}_${key}` : key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const fetchCache = async <T>(key: string, prefix?: string) => {
  try {
    const result = (await cache?.get(
      prefix ? `${prefix}_${key}` : key
    )) as string;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
};

export const invalidateCache = async (key: string, prefix?: string) => {
  try {
    await cache?.del(prefix ? `${prefix}_${key}` : key);
    return true;
  } catch {
    return false;
  }
};
