import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { rooms } from "~/services/schema.server";

// Get Room List
export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  const roomId = params.roomId;

  if (!roomId) {
    return json("RoomId Missing!", {
      status: 400,
      statusText: "The RoomId is Missing!",
    });
  }

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
  });

  if (!room) {
    throw new Response(null, {
      status: 404,
      statusText: "NOT NOOOOOO!",
    });
  }

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      db.query.rooms
        .findFirst({
          where: eq(rooms.id, roomId || ""),
          with: {
            logs: true,
          },
        })
        .then((roomFromDb) => {
          return send({
            event: `room-${roomId}`,
            data: JSON.stringify(roomFromDb),
          });
        });
    }

    // Initial fetch
    db.query.rooms
      .findFirst({
        where: eq(rooms.id, roomId || ""),
        with: {
          logs: true,
        },
      })
      .then((roomFromDb) => {
        return send({
          event: `room-${roomId}`,
          data: JSON.stringify(roomFromDb),
        });
      });

    emitter.on("room", handler);

    return function clear() {
      emitter.off("room", handler);
    };
  });
}
