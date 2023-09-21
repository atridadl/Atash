import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import { db } from "@/_lib/db";
import { rooms } from "@/_lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("UNAUTHORIZED", {
      status: 403,
      statusText: "Unauthorized!",
    });
  }

  if (!params.roomId) {
    return new NextResponse("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const roomFromDb = await db.query.rooms.findFirst({
    where: eq(rooms.id, params.roomId),
    with: {
      logs: true,
    },
  });

  return NextResponse.json(roomFromDb, {
    status: 200,
    statusText: "SUCCESS",
  });
}
