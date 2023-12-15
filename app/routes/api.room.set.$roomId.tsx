import { getAuth } from "@clerk/remix/ssr.server";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createId } from "@paralleldrive/cuid2";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { logs, rooms, votes } from "~/services/schema.server";
import { eq } from "drizzle-orm";

export async function action({ request, params, context }: ActionFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const data = await request.json();
  const roomId = params.roomId;

  if (data.log) {
    const oldRoom = await db.query.rooms.findFirst({
      where: eq(rooms.id, params.roomId || ""),
      with: {
        votes: true,
        logs: true,
      },
    });

    oldRoom &&
      (await db.insert(logs).values({
        id: `log_${createId()}`,
        created_at: Date.now().toString(),
        userId: userId || "",
        roomId: roomId || "",
        scale: oldRoom.scale,
        votes: JSON.stringify(
          oldRoom.votes.map((vote) => {
            return {
              name: vote.userId,
              value: vote.value,
            };
          })
        ),
        roomName: oldRoom.roomName,
        storyName: oldRoom.storyName,
      }));
  }

  if (data.reset) {
    await db.delete(votes).where(eq(votes.roomId, params.roomId || ""));
  }

  const newRoom = data.reset
    ? await db
        .update(rooms)
        .set({
          storyName: data.name,
          visible: data.visible,
          scale: [...new Set(data.scale.split(","))]
            .filter((item) => item !== "")
            .toString(),
        })
        .where(eq(rooms.id, params.roomId || ""))
        .returning()
    : await db
        .update(rooms)
        .set({
          visible: data.visible,
        })
        .where(eq(rooms.id, params.roomId || ""))
        .returning();

  const success = newRoom.length > 0;

  if (success) {
    console.log(success);
    emitter.emit("nodes", "room");
    emitter.emit("nodes", "votes");

    return json(newRoom, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}
