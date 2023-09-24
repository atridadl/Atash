import { NextResponse } from "next/server";

import { fetchCache, invalidateCache, setCache } from "@/_lib/redis";
import { db } from "@/_lib/db";
import { rooms } from "@/_lib/schema";
import { and, eq, isNull } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { publishToChannel } from "@/_lib/ably";
import { EventTypes } from "@/_utils/types";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export async function GET(request: Request) {
  const userId = request.headers.get("X-User-Id") as string;
  const orgId = request.headers.get("X-Org-Id") as string;

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
        where: and(eq(rooms.userId, userId), isNull(rooms.orgId)),
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
  const userId = request.headers.get("X-User-Id") as string;
  const orgId = request.headers.get("X-Org-Id") as string;

  const reqBody = (await request.json()) as { name: string };

  const room = await db
    .insert(rooms)
    .values({
      id: `room_${createId()}`,
      userId,
      roomName: reqBody.name,
      topicName: "First Topic!",
      scale: "0.5,1,2,3,5,8",
      visible: false,
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
