"use server";

import { createId } from "@paralleldrive/cuid2";
import { db } from "../db";
import { logs, rooms, votes } from "../schema";
import { auth } from "@clerk/nextjs";
import { fetchCache, invalidateCache, setCache } from "../redis";
import { publishToChannel } from "../ably";
import { EventTypes } from "@/utils/types";
import { and, eq, isNull } from "drizzle-orm";

export const createRoom = async (name: string) => {
  const { userId, orgId } = auth();

  if (!userId) {
    return false;
  }

  const room = await db
    .insert(rooms)
    .values({
      id: `room_${createId()}`,
      userId,
      roomName: name,
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
  return success;
};

export const deleteRoom = async (id: string) => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, id))
    .returning();

  const success = deletedRoom.length > 0;

  if (success) {
    await invalidateCache(`kv_roomcount`);
    await invalidateCache(`kv_votecount`);
    await invalidateCache(`kv_roomlist_${userId}`);

    await publishToChannel(
      `${userId}`,
      EventTypes.ROOM_LIST_UPDATE,
      JSON.stringify(deletedRoom)
    );

    await publishToChannel(
      `${id}`,
      EventTypes.ROOM_UPDATE,
      JSON.stringify(deletedRoom)
    );

    await publishToChannel(
      `stats`,
      EventTypes.STATS_UPDATE,
      JSON.stringify(deletedRoom)
    );
  }

  return success;
};

export const getRoom = async (id: string) => {
  const { userId } = auth();

  if (!userId) {
    return undefined;
  }

  const roomFromDb = await db.query.rooms.findFirst({
    where: eq(rooms.id, id),
    with: {
      logs: true,
    },
  });
  console.log(roomFromDb);
  return roomFromDb;
};

export const getRooms = async () => {
  const { userId, orgId } = auth();

  if (!userId) {
    return undefined;
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
      return cachedResult;
    } else {
      const roomList = await db.query.rooms.findMany({
        where: eq(rooms.orgId, orgId),
      });

      await setCache(`kv_roomlist_${orgId}`, roomList);

      return roomList;
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
      return cachedResult;
    } else {
      const roomList = await db.query.rooms.findMany({
        where: and(eq(rooms.userId, userId), isNull(rooms.orgId)),
      });

      await setCache(`kv_roomlist_${userId}`, roomList);

      return roomList;
    }
  }
};

export const setRoom = async (
  name: string,
  visible: boolean,
  scale: string,
  roomId: string,
  reset: boolean,
  log: boolean
) => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  if (reset) {
    if (log) {
      const oldRoom = await db.query.rooms.findFirst({
        where: eq(rooms.id, roomId),
        with: {
          votes: true,
          logs: true,
        },
      });

      oldRoom &&
        (await db.insert(logs).values({
          id: `log_${createId()}`,
          userId: userId,
          roomId: roomId,
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

    await db.delete(votes).where(eq(votes.roomId, roomId));

    await invalidateCache(`kv_votes_${roomId}`);
  }

  const newRoom = await db
    .update(rooms)
    .set({
      topicName: name,
      visible: visible,
      scale: [...new Set(scale.split(","))]
        .filter((item) => item !== "")
        .toString(),
    })
    .where(eq(rooms.id, roomId))
    .returning();

  const success = newRoom.length > 0;

  if (success) {
    await publishToChannel(
      `${roomId}`,
      EventTypes.ROOM_UPDATE,
      JSON.stringify(newRoom)
    );
  }

  return success;
};
