import { NextResponse } from "next/server";

import { db } from "@/_lib/db";
import { votes } from "@/_lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

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

  const votesByRoomId = await db.query.votes.findMany({
    where: eq(votes.roomId, params.roomId),
  });

  return NextResponse.json(votesByRoomId, {
    status: 200,
    statusText: "SUCCESS!",
  });
}
