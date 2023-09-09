type BetterEnum<T> = T[keyof T];

export const EventTypes = {
  ROOM_LIST_UPDATE: "room.list.update",
  ROOM_UPDATE: "room.update",
  VOTE_UPDATE: "vote.update",
  STATS_UPDATE: "stats.update",
} as const;
export type EventType = BetterEnum<typeof EventTypes>;

export interface PresenceItem {
  name: string;
  image: string;
  client_id: string;
  isAdmin: boolean;
  isVIP: boolean;
}
