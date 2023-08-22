import {
  timestamp,
  pgTable,
  varchar,
  boolean,
  json,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const rooms = pgTable("Room", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("userId", { length: 255 }).notNull(),
  orgId: varchar("orgId", { length: 255 }),
  roomName: varchar("roomName", { length: 255 }),
  storyName: varchar("storyName", { length: 255 }),
  visible: boolean("visible").default(false).notNull(),
  scale: varchar("scale", { length: 255 }).default("0.5,1,2,3,5").notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  votes: many(votes),
  logs: many(logs),
}));

export const votes = pgTable(
  "Vote",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    created_at: timestamp("created_at").defaultNow(),
    userId: varchar("userId", { length: 255 }).notNull(),
    roomId: varchar("roomId", { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    value: varchar("value", { length: 255 }).notNull(),
  },
  (table) => {
    return {
      userIdx: index("user_idx").on(table.userId),
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

export const logs = pgTable(
  "Log",
  {
    id: varchar("id", { length: 255 }).notNull().primaryKey(),
    created_at: timestamp("created_at").defaultNow(),
    userId: varchar("userId", { length: 255 }).notNull(),
    roomId: varchar("roomId", { length: 255 })
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    scale: varchar("scale", { length: 255 }),
    votes: json("votes"),
    roomName: varchar("roomName", { length: 255 }),
    storyName: varchar("storyName", { length: 255 }),
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
