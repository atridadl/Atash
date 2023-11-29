// type BetterEnum<T> = T[keyof T];

export interface PresenceItem {
  id: string;
  userId: string;
  userFullName: string;
  userImageUrl: string;
  roomId: string;
  value: string;
  isAdmin: boolean;
  isVIP: boolean;
}

export type RoomsResponse =
  | {
      id: string;
      createdAt: Date;
      roomName: string;
    }[]
  | {
      roomName: string | null;
      id: string;
      created_at: Date | null;
      userId: string;
      storyName: string | null;
      visible: boolean;
      scale: string;
    }[]
  | null
  | undefined;

export type RoomResponse =
  | {
      id: string;
      created_at: Date | null;
      userId: string;
      roomName: string | null;
      storyName: string | null;
      visible: boolean;
      scale: string | null;
      logs: {
        id: string;
        created_at: Date | null;
        userId: string;
        roomId: string;
        roomName: string | null;
        storyName: string | null;
        scale: string | null;
        votes: unknown;
      }[];
    }
  | undefined
  | null;

export type VoteResponse =
  | {
      id: string;
      value: string;
      created_at: Date | null;
      userId: string;
      roomId: string;
    }[]
  | null
  | undefined;
