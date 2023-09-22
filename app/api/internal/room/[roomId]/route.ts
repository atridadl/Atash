import { NextRequest, NextResponse } from "next/server";

import { auth, getAuth } from "@clerk/nextjs/server";
import { db } from "@/_lib/db";
import { logs, rooms, votes } from "@/_lib/schema";
import { eq } from "drizzle-orm";
import { publishToChannel } from "@/_lib/ably";
import { EventTypes } from "@/_utils/types";
import { invalidateCache } from "@/_lib/redis";
import { createId } from "@paralleldrive/cuid2";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as NextRequest);

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

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId, orgId } = auth();

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

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, params.roomId))
    .returning();

  const success = deletedRoom.length > 0;

  if (success) {
    await publishToChannel(
      `${userId}`,
      EventTypes.ROOM_LIST_UPDATE,
      JSON.stringify(deletedRoom)
    );

    await publishToChannel(
      `${params.roomId}`,
      EventTypes.ROOM_UPDATE,
      JSON.stringify(deletedRoom)
    );

    if (orgId) {
      await invalidateCache(`kv_roomlist_${orgId}`);

      await publishToChannel(
        `${orgId}`,
        EventTypes.ROOM_LIST_UPDATE,
        JSON.stringify(deletedRoom)
      );
    } else {
      await invalidateCache(`kv_roomlist_${userId}`);

      await publishToChannel(
        `${userId}`,
        EventTypes.ROOM_LIST_UPDATE,
        JSON.stringify(deletedRoom)
      );
    }

    return NextResponse.json(deletedRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Error deleting room!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  const { userId } = getAuth(request as NextRequest);

  const reqBody = (await request.json()) as {
    name: string;
    visible: boolean;
    scale: string;
    reset: boolean;
    log: boolean;
  };

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

  if (reqBody.reset) {
    if (reqBody.log) {
      const oldRoom = await db.query.rooms.findFirst({
        where: eq(rooms.id, params.roomId),
        with: {
          votes: true,
          logs: true,
        },
      });

      oldRoom &&
        (await db.insert(logs).values({
          id: `log_${createId()}`,
          userId: userId,
          roomId: params.roomId,
          scale: oldRoom.scale,
          votes: oldRoom.votes.map((vote) => {
            return {
              name: vote.userId,
              value: vote.value,
            };
          }),
          roomName: oldRoom.roomName,
          topicName: oldRoom.topicName,
        }));
    }

    await db.delete(votes).where(eq(votes.roomId, params.roomId));

    await invalidateCache(`kv_votes_${params.roomId}`);
  }

  const newRoom = await db
    .update(rooms)
    .set({
      topicName: reqBody.name,
      visible: reqBody.visible,
      scale: [...new Set(reqBody.scale.split(","))]
        .filter((item) => item !== "")
        .toString(),
    })
    .where(eq(rooms.id, params.roomId))
    .returning();

  const success = newRoom.length > 0;

  if (success) {
    await publishToChannel(
      `${params.roomId}`,
      EventTypes.ROOM_UPDATE,
      JSON.stringify(newRoom)
    );
  }

  if (success) {
    return NextResponse.json(newRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Room update failed" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}
