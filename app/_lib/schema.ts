import {
  sqliteTable,
  integer,
  text,
  unique,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const rooms = sqliteTable("Room", {
  id: text("id", { length: 255 }).notNull().primaryKey(),
  created_at: text("created_at"),
  userId: text("userId", { length: 255 }).notNull(),
  orgId: text("orgId", { length: 255 }),
  roomName: text("roomName", { length: 255 }),
  topicName: text("topicName", { length: 255 }),
  visible: integer("visible").default(0).notNull(),
  scale: text("scale", { length: 255 }).default("0.5,1,2,3,5").notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  votes: many(votes),
  logs: many(logs),
}));

export const votes = sqliteTable(
  "Vote",
  {
    id: text("id", { length: 255 }).notNull().primaryKey(),
    created_at: text("created_at"),
    userId: text("userId", { length: 255 }).notNull(),
    roomId: text("roomId", { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    value: text("value", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      unq: unique().on(table.userId, table.roomId),
    };
  }
);

export const votesRelations = relations(votes, ({ one }) => ({
  room: one(rooms, {
    fields: [votes.roomId],
    references: [rooms.id],
  }),
}));

export const logs = sqliteTable(
  "Log",
  {
    id: text("id", { length: 255 }).notNull().primaryKey(),
    created_at: text("created_at"),
    userId: text("userId", { length: 255 }).notNull(),
    roomId: text("roomId", { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    scale: text("scale", { length: 255 }),
    votes: text("votes"),
    roomName: text("roomName", { length: 255 }),
    topicName: text("topicName", { length: 255 }),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.userId),
    };
  }
);

export const logsRelations = relations(logs, ({ one }) => ({
  room: one(rooms, {
    fields: [logs.roomId],
    references: [rooms.id],
  }),
}));
