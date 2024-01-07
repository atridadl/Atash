import { getAuth } from "@clerk/remix/ssr.server";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { createId } from "@paralleldrive/cuid2";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { votes } from "~/services/schema.server";

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

  const upsertResult = await db
    .insert(votes)
    .values({
      id: `vote_${createId()}`,
      created_at: Date.now().toString(),
      value: data.value,
      userId: userId || "",
      roomId: roomId || "",
    })
    .onConflictDoUpdate({
      target: [votes.userId, votes.roomId],
      set: {
        created_at: Date.now().toString(),
        value: data.value,
        userId: userId || "",
        roomId: roomId,
      },
    });

  const success = upsertResult.count > 0;

  if (success) {
    emitter.emit("nodes", "votes");

    return json(upsertResult, {
      status: 200,
      statusText: "SUCCESS",
    });
  }
}
