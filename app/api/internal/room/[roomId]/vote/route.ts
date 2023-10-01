import { NextResponse } from "next/server";

import { publishToChannel } from "@/_lib/ably";
import { db } from "@/_lib/db";
import { invalidateCache } from "@/_lib/redis";
import { votes } from "@/_lib/schema";
import { EventTypes } from "@/_utils/types";
import { type RequestLike } from "@clerk/nextjs/dist/types/server/types";
import { getAuth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "edge";

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as RequestLike);

  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const reqBody = (await request.json()) as { value: string };

  const upsertResult = await db
    .insert(votes)
    .values({
      id: `vote_${createId()}`,
      value: reqBody.value,
      userId: userId || "",
      roomId: params.roomId,
    })
    .onConflictDoUpdate({
      target: [votes.userId, votes.roomId],
      set: {
        value: reqBody.value,
        userId: userId || "",
        roomId: params.roomId,
      },
    });

  const success = upsertResult.rowsAffected > 0;

  if (success) {
    await invalidateCache(`kv_votes_${params.roomId}`);

    await publishToChannel(
      `${params.roomId}`,
      EventTypes.VOTE_UPDATE,
      reqBody.value
    );

    await publishToChannel(
      `stats`,
      EventTypes.STATS_UPDATE,
      JSON.stringify(success)
    );

    return NextResponse.json(upsertResult, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Failed to set vote!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}
