import { z } from "zod";

type BetterEnum<T> = T[keyof T];

export const EventTypes = {
  ROOM_LIST_UPDATE: "room.list.update",
  ROOM_UPDATE: "room.update",
  VOTE_UPDATE: "vote.update",
  STATS_UPDATE: "stats.update",
} as const;
export type EventType = BetterEnum<typeof EventTypes>;

export const WebhookEvents = {
  USER_CREATED: "user.created",
  USER_DELETED: "user.deleted",
} as const;
export type WebhookEvent = BetterEnum<typeof WebhookEvents>;

export const WebhookEventBodySchema = z.object({
  data: z.object({
    id: z.string(),
    email_addresses: z
      .array(
        z.object({
          email_address: z.string().email(),
          id: z.string().optional(),
          verification: z
            .object({
              status: z.string().optional(),
              strategy: z.string().optional(),
            })
            .optional(),
        })
      )
      .optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
  }),
  type: z.string(),
});

export type WebhookEventBody = z.infer<typeof WebhookEventBodySchema>;

export interface PresenceItem {
  name: string;
  image: string;
  client_id: string;
  isAdmin: boolean;
  isVIP: boolean;
}
