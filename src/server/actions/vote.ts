"use server";

import { createId } from "@paralleldrive/cuid2";
import { db } from "../db";
import { votes } from "../schema";
import { auth } from "@clerk/nextjs";
import { fetchCache, invalidateCache, setCache } from "../redis";
import { publishToChannel } from "../ably";
import { EventTypes } from "@/utils/types";
import { eq } from "drizzle-orm";

export const getVotes = async (roomId: string) => {
  const { userId } = auth();

  if (!userId) {
    return undefined;
  }

  const cachedResult = await fetchCache<
    {
      id: string;
      value: string;
      created_at: Date;
      userId: string;
      roomId: string;
    }[]
  >(`kv_votes_${roomId}`);

  if (cachedResult) {
    return cachedResult;
  } else {
    const votesByRoomId = await db.query.votes.findMany({
      where: eq(votes.roomId, roomId),
    });

    await setCache(`kv_votes_${roomId}`, votesByRoomId);

    return votesByRoomId;
  }
};

export const setVote = async (value: string, roomId: string) => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const upsertResult = await db
    .insert(votes)
    .values({
      id: `vote_${createId()}`,
      value: value,
      userId: userId,
      roomId: roomId,
    })
    .onConflictDoUpdate({
      target: [votes.userId, votes.roomId],
      set: {
        value: value,
        userId: userId,
        roomId: roomId,
      },
    });

  const success = upsertResult.rowCount > 0;

  if (success) {
    await invalidateCache(`kv_votecount`);
    await invalidateCache(`kv_votes_${roomId}`);

    await publishToChannel(`${roomId}`, EventTypes.VOTE_UPDATE, value);

    await publishToChannel(
      `stats`,
      EventTypes.STATS_UPDATE,
      JSON.stringify(success)
    );
  }

  return success;
};
