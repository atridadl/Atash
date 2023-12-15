import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { votes } from "~/services/schema.server";

// Get Room List
export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

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

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      const votesByRoomId = await db.query.votes.findMany({
        where: eq(votes.roomId, roomId || ""),
      });
      send({ event: `votes-${roomId}`, data: JSON.stringify(votesByRoomId) });
    }

    // Initial fetch
    db.query.votes
      .findMany({
        where: eq(votes.roomId, roomId || ""),
      })
      .then((votesByRoomId) => {
        return send({
          event: `votes-${roomId}`,
          data: JSON.stringify(votesByRoomId),
        });
      });

    emitter.on("votes", handler);

    return function clear() {
      emitter.off("votes", handler);
    };
  });
}
