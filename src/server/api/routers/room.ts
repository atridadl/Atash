import { z } from "zod";
import { publishToChannel } from "~/server/ably";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { fetchCache, invalidateCache, setCache } from "~/server/redis";
import { logs, rooms, votes } from "~/server/schema";
import { EventTypes } from "~/utils/types";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";

export const roomRouter = createTRPCRouter({
  // Create
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.insert(rooms).values({
        id: createId(),
        userId: ctx.auth.userId,
        roomName: input.name,
        storyName: "First Story!",
        scale: "0.5,1,2,3,5,8",
        visible: false,
      });

      const success = room.rowsAffected > 0;
      if (room) {
        await invalidateCache(`kv_roomcount`);
        await invalidateCache(`kv_roomlist_${ctx.auth.userId}`);

        await publishToChannel(
          `${ctx.auth.userId}`,
          EventTypes.ROOM_LIST_UPDATE,
          JSON.stringify(room)
        );

        await publishToChannel(
          `stats`,
          EventTypes.STATS_UPDATE,
          JSON.stringify(room)
        );
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
          logs: {
            with: {
              room: true,
            },
          },
          votes: {
            with: {
              room: true,
            },
          },
        },
      });
      return roomFromDb || null;
    }),

  // Get All
  getAll: protectedProcedure.query(async ({ ctx }) => {
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
        where: eq(rooms.userId, ctx.auth.userId),
      });

      await setCache(`kv_roomlist_${ctx.auth.userId}`, roomList);

      return roomList;
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
              id: createId(),
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
        .where(eq(rooms.id, input.roomId));

      const success = newRoom.rowsAffected > 0;

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
        .where(eq(rooms.id, input.id));

      const success = deletedRoom.rowsAffected > 0;

      if (success) {
        await ctx.db.delete(votes).where(eq(votes.roomId, input.id));

        await ctx.db.delete(logs).where(eq(logs.roomId, input.id));

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
