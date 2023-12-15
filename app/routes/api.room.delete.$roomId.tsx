import { getAuth } from "@clerk/remix/ssr.server";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { invalidateCache } from "~/services/redis.server";
import { rooms } from "~/services/schema.server";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const roomId = params.roomId;

  if (!roomId) {
    return json("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  const deletedRoom = await db
    .delete(rooms)
    .where(eq(rooms.id, roomId))
    .returning();

  const success = deletedRoom.length > 0;

  if (success) {
    await invalidateCache(`kv_roomlist_${userId}`, "atash");
    emitter.emit("nodes", "roomlist");

    return json(deletedRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}
