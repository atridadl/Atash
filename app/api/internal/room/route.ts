import { NextResponse } from "next/server";

import { publishToChannel } from "@/_lib/ably";
import { db } from "@/_lib/db";
import { fetchCache, invalidateCache, setCache } from "@/_lib/redis";
import { rooms } from "@/_lib/schema";
import { EventTypes } from "@/_utils/types";
import { type RequestLike } from "@clerk/nextjs/dist/types/server/types";
import { getAuth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNull } from "drizzle-orm";

export async function GET(request: Request) {
  const { userId, orgId } = getAuth(request as RequestLike);

  if (orgId) {
    const cachedResult = await fetchCache<
      {
        id: string;
        createdAt: Date;
        roomName: string;
      }[]
    >(`kv_roomlist_${orgId}`);

    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        status: 200,
        statusText: "SUCCESS",
      });
    } else {
      const roomList = await db.query.rooms.findMany({
        where: eq(rooms.orgId, orgId),
      });

      await setCache(`kv_roomlist_${orgId}`, roomList);

      return NextResponse.json(roomList, {
        status: 200,
        statusText: "SUCCESS",
      });
    }
  } else {
    const cachedResult = await fetchCache<
      {
        id: string;
        createdAt: Date;
        roomName: string;
      }[]
    >(`kv_roomlist_${userId}`);

    if (cachedResult) {
      return NextResponse.json(cachedResult, {
        status: 200,
        statusText: "SUCCESS",
      });
    } else {
      const roomList = await db.query.rooms.findMany({
        where: and(eq(rooms.userId, userId || ""), isNull(rooms.orgId)),
      });

      await setCache(`kv_roomlist_${userId}`, roomList);

      return NextResponse.json(roomList, {
        status: 200,
        statusText: "SUCCESS",
      });
    }
  }
}

export async function POST(request: Request) {
  const { userId, orgId } = getAuth(request as RequestLike);

  const reqBody = (await request.json()) as { name: string };

  const room = await db
    .insert(rooms)
    .values({
      id: `room_${createId()}`,
      created_at: Date.now().toString(),
      userId: userId || "",
      roomName: reqBody.name,
      topicName: "First Topic!",
      scale: "0.5,1,2,3,5,8",
      visible: 0,
      orgId: orgId,
    })
    .returning();

  const success = room.length > 0;

  if (room) {
    if (orgId) {
      await invalidateCache(`kv_roomlist_${orgId}`);

      await publishToChannel(
        `${orgId}`,
        EventTypes.ROOM_LIST_UPDATE,
        JSON.stringify(room)
      );
    } else {
      await invalidateCache(`kv_roomlist_${userId}`);

      await publishToChannel(
        `${userId}`,
        EventTypes.ROOM_LIST_UPDATE,
        JSON.stringify(room)
      );
    }
  }

  if (success) {
    return NextResponse.json(room, {
      status: 200,
      statusText: "SUCCESS",
    });
  }

  return NextResponse.json(
    { error: "Failed to create room!" },
    {
      status: 500,
      statusText: "ERROR",
    }
  );
}
