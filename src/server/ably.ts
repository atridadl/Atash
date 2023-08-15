import Ably from "ably";
import { env } from "~/env.mjs";
import type { EventType } from "../utils/types";

export const publishToChannel = async (
  channel: string,
  event: EventType,
  message: string
) => {
  const ably = new Ably.Rest.Promise(env.ABLY_PRIVATE_KEY);
  const ablyChannel = ably.channels.get(`${env.APP_ENV}-${channel}`);
  await ablyChannel.publish(event, message, { quickAck: true });
};
