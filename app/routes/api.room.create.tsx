import { getAuth } from "@clerk/remix/ssr.server";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createId } from "@paralleldrive/cuid2";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { rooms } from "~/services/schema.server";
import { invalidateCache } from "~/services/redis.server";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const data = await request.json();

  const room = await db
    .insert(rooms)
    .values({
      id: `room_${createId()}`,
      created_at: Date.now().toString(),
      userId: userId || "",
      roomName: data.name,
      storyName: "First Story!",
      scale: "0.5,1,2,3,5,8",
      visible: 0,
    })
    .returning();

  const success = room.length > 0;

  if (success) {
    await invalidateCache(`kv_roomlist_${userId}`, "atash");
    emitter.emit("nodes", "roomlist");

    return json(room, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}
