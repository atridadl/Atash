import { z } from "zod";
import { publishToChannel } from "~/server/ably";
import { createTRPCRouter, protectedProcedure } from "~/server/trpc/trpc";

import { fetchCache, invalidateCache, setCache } from "~/server/redis";
import { logs, rooms, votes } from "~/server/schema";
import { EventTypes } from "~/utils/types";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNull } from "drizzle-orm";

export const roomRouter = createTRPCRouter({
  // Create
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db
        .insert(rooms)
        .values({
          id: `room_${createId()}`,
          userId: ctx.auth.userId,
          roomName: input.name,
          storyName: "First Story!",
          scale: "0.5,1,2,3,5,8",
          visible: false,
          orgId: ctx.auth.orgId,
        })
        .returning();

      const success = room.length > 0;
      if (room) {
        if (ctx.auth.orgId) {
          await invalidateCache(`kv_roomlist_${ctx.auth.orgId}`);

          await publishToChannel(
            `${ctx.auth.orgId}`,
            EventTypes.ROOM_LIST_UPDATE,
            JSON.stringify(room)
          );
        } else {
          await invalidateCache(`kv_roomlist_${ctx.auth.userId}`);

          await publishToChannel(
            `${ctx.auth.userId}`,
            EventTypes.ROOM_LIST_UPDATE,
            JSON.stringify(room)
          );
        }
      }
      return success;
    }),

  // Get One
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const roomFromDb = await ctx.db.query.rooms.findFirst({
        where: eq(rooms.id, input.id),
        with: {
          logs: true,
        },
      });
      return roomFromDb || null;
    }),

  // Get All
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.auth.orgId) {
      const cachedResult = await fetchCache<
        {
          id: string;
          createdAt: Date;
          roomName: string;
        }[]
      >(`kv_roomlist_${ctx.auth.orgId}`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const roomList = await ctx.db.query.rooms.findMany({
          where: eq(rooms.orgId, ctx.auth.orgId),
        });

        await setCache(`kv_roomlist_${ctx.auth.orgId}`, roomList);

        return roomList;
      }
    } else {
      const cachedResult = await fetchCache<
        {
          id: string;
          createdAt: Date;
          roomName: string;
        }[]
      >(`kv_roomlist_${ctx.auth.userId}`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const roomList = await ctx.db.query.rooms.findMany({
          where: and(eq(rooms.userId, ctx.auth.userId), isNull(rooms.orgId)),
        });

        await setCache(`kv_roomlist_${ctx.auth.userId}`, roomList);

        return roomList;
      }
    }
  }),

  // Update One
  set: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        visible: z.boolean(),
        scale: z.string(),
        roomId: z.string(),
        reset: z.boolean(),
        log: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.reset) {
        if (input.log) {
          const oldRoom = await ctx.db.query.rooms.findFirst({
            where: eq(rooms.id, input.roomId),
            with: {
              votes: true,
              logs: true,
            },
          });

          oldRoom &&
            (await ctx.db.insert(logs).values({
              id: `log_${createId()}`,
              userId: ctx.auth.userId,
              roomId: input.roomId,
              scale: oldRoom.scale,
              votes: oldRoom.votes.map((vote) => {
                return {
                  name: vote.userId,
                  value: vote.value,
                };
              }),
              roomName: oldRoom.roomName,
              storyName: oldRoom.storyName,
            }));
        }

        await ctx.db.delete(votes).where(eq(votes.roomId, input.roomId));

        await invalidateCache(`kv_votes_${input.roomId}`);
      }

      const newRoom = await ctx.db
        .update(rooms)
        .set({
          storyName: input.name,
          visible: input.visible,
          scale: [...new Set(input.scale.split(","))]
            .filter((item) => item !== "")
            .toString(),
        })
        .where(eq(rooms.id, input.roomId))
        .returning();

      const success = newRoom.length > 0;

      if (success) {
        await publishToChannel(
          `${input.roomId}`,
          EventTypes.ROOM_UPDATE,
          JSON.stringify(newRoom)
        );
      }

      return success;
    }),

  // Delete One
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedRoom = await ctx.db
        .delete(rooms)
        .where(eq(rooms.id, input.id))
        .returning();

      const success = deletedRoom.length > 0;

      if (success) {
        await invalidateCache(`kv_roomcount`);
        await invalidateCache(`kv_votecount`);
        await invalidateCache(`kv_roomlist_${ctx.auth.userId}`);

        await publishToChannel(
          `${ctx.auth.userId}`,
          EventTypes.ROOM_LIST_UPDATE,
          JSON.stringify(deletedRoom)
        );

        await publishToChannel(
          `${input.id}`,
          EventTypes.ROOM_UPDATE,
          JSON.stringify(deletedRoom)
        );

        await publishToChannel(
          `stats`,
          EventTypes.STATS_UPDATE,
          JSON.stringify(deletedRoom)
        );
      }

      return success;
    }),
});
