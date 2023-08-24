import { env } from "~/env.mjs";
import type { EventType } from "../utils/types";

export const publishToChannel = async (
  channel: string,
  event: EventType,
  message: string
) => {
  await fetch(
    `https://rest.ably.io/channels/${env.APP_ENV}-${channel}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(env.ABLY_PRIVATE_KEY)}`,
      },
      body: JSON.stringify({
        name: event,
        data: message,
      }),
    }
  );
};
