import { z } from "zod";
import { publishToChannel } from "~/server/ably";

import { createTRPCRouter, protectedProcedure } from "~/server/trpc/trpc";
import { fetchCache, invalidateCache, setCache } from "~/server/redis";
import { EventTypes } from "~/utils/types";
import { eq } from "drizzle-orm";
import { votes } from "~/server/schema";
import { createId } from "@paralleldrive/cuid2";

export const voteRouter = createTRPCRouter({
  getAllByRoomId: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cachedResult = await fetchCache<
        {
          id: string;
          value: string;
          created_at: Date;
          userId: string;
          roomId: string;
        }[]
      >(`kv_votes_${input.roomId}`);

      if (cachedResult) {
        return cachedResult;
      } else {
        const votesByRoomId = await ctx.db.query.votes.findMany({
          where: eq(votes.roomId, input.roomId),
        });

        await setCache(`kv_votes_${input.roomId}`, votesByRoomId);

        return votesByRoomId;
      }
    }),
  set: protectedProcedure
    .input(z.object({ value: z.string(), roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const upsertResult = await ctx.db
        .insert(votes)
        .values({
          id: `vote_${createId()}`,
          value: input.value,
          userId: ctx.auth.userId,
          roomId: input.roomId,
        })
        .onConflictDoUpdate({
          target: [votes.userId, votes.roomId],
          set: {
            value: input.value,
            userId: ctx.auth.userId,
            roomId: input.roomId,
          },
        });

      const success = upsertResult.rowCount > 0;

      if (success) {
        await invalidateCache(`kv_votecount`);
        await invalidateCache(`kv_votes_${input.roomId}`);

        await publishToChannel(
          `${input.roomId}`,
          EventTypes.VOTE_UPDATE,
          input.value
        );

        await publishToChannel(
          `stats`,
          EventTypes.STATS_UPDATE,
          JSON.stringify(success)
        );
      }

      return success;
    }),
});
