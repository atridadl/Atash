import { env } from "env.mjs";
import type { EventType } from "@/_utils/types";

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
        Authorization: `Basic ${btoa(env.ABLY_API_KEY)}`,
      },
      body: JSON.stringify({
        name: event,
        data: message,
      }),
    }
  );
};

export const publishToMultipleChannels = async (
  channels: string[],
  events: EventType[],
  message: string
) => {
  await fetch(`https://rest.ably.io/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(env.ABLY_API_KEY)}`,
    },
    body: JSON.stringify({
      channels: channels.map((channel) => `${env.APP_ENV}-${channel}`),
      messages: events.map((event) => {
        return {
          name: event,
          data: message,
        };
      }),
    }),
  });
};
