import { NextResponse } from "next/server";

import { fetchCache, setCache } from "@/_lib/redis";
import { db } from "@/_lib/db";
import { votes } from "@/_lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const cachedResult = await fetchCache<
    {
      id: string;
      value: string;
      created_at: Date;
      userId: string;
      roomId: string;
    }[]
  >(`kv_votes_${params.roomId}`);

  if (cachedResult) {
    return NextResponse.json(cachedResult, {
      status: 200,
      statusText: "SUCCESS!",
    });
  } else {
    const votesByRoomId = await db.query.votes.findMany({
      where: eq(votes.roomId, params.roomId),
    });

    await setCache(`kv_votes_${params.roomId}`, votesByRoomId);

    return NextResponse.json(votesByRoomId, {
      status: 200,
      statusText: "SUCCESS!",
    });
  }
}
