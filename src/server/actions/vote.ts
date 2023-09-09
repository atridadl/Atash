"use server";

import { createId } from "@paralleldrive/cuid2";
import { db } from "../db";
import { votes } from "../schema";
import { auth } from "@clerk/nextjs";
import { fetchCache, invalidateCache, setCache } from "../redis";
import { publishToChannel } from "../ably";
import { EventTypes } from "@/utils/types";
import { eq } from "drizzle-orm";

/**
 * Retrieves votes for a specific room.
 *
 * @param {string} roomId - The ID of the room for which votes are retrieved.
 * @returns {Promise<object[]|null>} - A promise that resolves to an array of vote objects or null if not found.
 */
export const getVotes = async (roomId: string) => {
  const { userId } = auth();

  if (!userId) {
    return null;
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

/**
 * Sets a vote value for a room.
 *
 * @param {string} value - The value of the vote.
 * @param {string} roomId - The ID of the room for which the vote is being set.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating the success of the vote setting.
 */
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
