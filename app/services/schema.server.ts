import {
  pgTable,
  text,
  unique,
  index,
  boolean
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const rooms = pgTable("Room", {
  id: text("id").notNull().primaryKey(),
  created_at: text("created_at"),
  userId: text("userId").notNull(),
  roomName: text("roomName"),
  storyName: text("storyName"),
  visible: boolean("visible").default(false).notNull(),
  scale: text("scale").default("0.5,1,2,3,5").notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  votes: many(votes),
  logs: many(logs),
}));

export const votes = pgTable(
  "Vote",
  {
    id: text("id").notNull().primaryKey(),
    created_at: text("created_at"),
    userId: text("userId").notNull(),
    roomId: text("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    value: text("value").notNull(),
  },
  (table) => {
    return {
      unq: unique().on(table.userId, table.roomId),
      userVoteIdx: index("user_vote_idx").on(table.userId),
    };
  }
);

export const votesRelations = relations(votes, ({ one }) => ({
  room: one(rooms, {
    fields: [votes.roomId],
    references: [rooms.id],
  }),
}));

export const logs = pgTable(
  "Log",
  {
    id: text("id").notNull().primaryKey(),
    created_at: text("created_at"),
    userId: text("userId").notNull(),
    roomId: text("roomId").notNull(),
    scale: text("scale"),
    votes: text("votes"),
    roomName: text("roomName"),
    storyName: text("storyName"),
  },
  (table) => {
    return {
      userLogIdx: index("user_log_idx").on(table.userId),
    };
  }
);

export const logsRelations = relations(logs, ({ one }) => ({
  room: one(rooms, {
    fields: [logs.roomId],
    references: [rooms.id],
  }),
}));

export const presence = pgTable(
  "Presence",
  {
    id: text("id").notNull().primaryKey(),
    userId: text("userId").notNull(),
    userFullName: text("userFullName").notNull(),
    userImageUrl: text("userImageUrl").notNull(),
    isVIP: boolean("isVIP").default(false).notNull(),
    isAdmin: boolean("isAdmin").default(false).notNull(),
    roomId: text("roomId")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      unq: unique().on(table.userId, table.roomId),
    };
  }
);
