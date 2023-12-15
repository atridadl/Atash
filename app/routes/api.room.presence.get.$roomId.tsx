import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { and, eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { presence } from "~/services/schema.server";
import { createId } from "@paralleldrive/cuid2";

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId, sessionClaims } = await getAuth({ context, params, request });

  const roomId = params.roomId;

  if (!roomId) {
    return json("RoomId Missing!", {
      status: 400,
      statusText: "BAD REQUEST!",
    });
  }

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const name = sessionClaims.name as string;
  const image = sessionClaims.image as string;
  const metadata = sessionClaims.metadata as {
    isAdmin: boolean;
    isVIP: boolean;
  };

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      const presenceData = await db.query.presence.findMany({
        where: and(eq(presence.roomId, roomId || "")),
      });

      send({
        event: `${userId}-${params.roomId}`,
        data: JSON.stringify(
          presenceData.map((presenceItem) => {
            return {
              ...presenceItem,
              isAdmin: presenceItem.isAdmin === 0 ? false : true,
              isVIP: presenceItem.isVIP === 0 ? false : true,
            };
          })
        ),
      });
    }

    db.insert(presence)
      .values({
        id: `presence_${createId()}`,
        roomId: roomId || "",
        userFullName: name,
        userId: userId,
        userImageUrl: image,
        isAdmin: metadata.isAdmin ? 1 : 0,
        isVIP: metadata.isVIP ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [presence.userId, presence.roomId],
        set: {
          roomId: roomId || "",
          userFullName: name,
          userId: userId,
          userImageUrl: image,
          isAdmin: metadata.isAdmin ? 1 : 0,
          isVIP: metadata.isVIP ? 1 : 0,
        },
      })
      .then(async () => {
        emitter.emit("nodes", "presence");
      });

    // Initial fetch
    emitter.on("presence", handler);

    return function clear() {
      db.delete(presence)
        .where(and(eq(presence.roomId, roomId), eq(presence.userId, userId)))
        .returning()
        .then(async () => {
          emitter.emit("nodes", "presence");
        });
      emitter.off("presence", handler);
    };
  });
}
