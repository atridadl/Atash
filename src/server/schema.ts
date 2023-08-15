import {
  timestamp,
  mysqlTable,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const rooms = mysqlTable("Room", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("userId", { length: 255 }).notNull(),
  roomName: varchar("roomName", { length: 255 }),
  storyName: varchar("storyName", { length: 255 }),
  visible: boolean("visible").default(false).notNull(),
  scale: varchar("scale", { length: 255 }).default("0.5,1,2,3,5").notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  votes: many(votes),
  logs: many(logs),
}));

export const votes = mysqlTable("Vote", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("userId", { length: 255 }).notNull(),
  roomId: varchar("roomId", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
});

export const votesRelations = relations(votes, ({ one }) => ({
  room: one(rooms, {
    fields: [votes.roomId],
    references: [rooms.id],
  }),
}));

export const logs = mysqlTable("Log", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  userId: varchar("userId", { length: 255 }).notNull(),
  roomId: varchar("roomId", { length: 255 }).notNull(),
  scale: varchar("scale", { length: 255 }),
  votes: json("votes"),
  roomName: varchar("roomName", { length: 255 }),
  storyName: varchar("storyName", { length: 255 }),
});

export const logsRelations = relations(logs, ({ one }) => ({
  room: one(rooms, {
    fields: [logs.roomId],
    references: [rooms.id],
  }),
}));
