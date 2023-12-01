import Redis from "ioredis";

export const cache = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      family: 6,
    })
  : null;

export const pub = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      family: 6,
    })
  : null;

export const sub = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      family: 6,
    })
  : null;

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
  `Unsubscribed successfully from ${channel}!`;
  Promise.resolve([sub?.unsubscribe(channel)]);
};

export const setCache = async <T>(key: string, value: T) => {
  try {
    await cache?.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const fetchCache = async <T>(key: string) => {
  try {
    const result = (await cache?.get(key)) as string;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
};

export const invalidateCache = async (key: string) => {
  try {
    await cache?.del(key);
    return true;
  } catch {
    return false;
  }
};
