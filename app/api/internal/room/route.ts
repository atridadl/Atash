import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs";
import { fetchCache, setCache } from "@/_lib/redis";
import { db } from "@/_lib/db";
import { rooms } from "@/_lib/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function GET() {
  const { userId, orgId } = auth();

  if (!userId) {
    return new NextResponse("UNAUTHORIZED", {
      status: 403,
      statusText: "Unauthorized!",
    });
  }

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
