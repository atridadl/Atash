import { type NextRequest, NextResponse } from "next/server";

import { invalidateCache } from "@/_lib/redis";
import { db } from "@/_lib/db";
import { votes } from "@/_lib/schema";
import { createId } from "@paralleldrive/cuid2";
import { publishToChannel } from "@/_lib/ably";
import { EventTypes } from "@/_utils/types";
import { getAuth } from "@clerk/nextjs/server";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as NextRequest);

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

  const success = upsertResult.rowCount > 0;

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
