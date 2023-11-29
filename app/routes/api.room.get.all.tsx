import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { rooms } from "~/services/schema";

// Get Room List
export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { userId } = await getAuth({ context, params, request });

  if (!userId) {
    return json("Not Signed In!", {
      status: 403,
      statusText: "UNAUTHORIZED!",
    });
  }

  return eventStream(request.signal, function setup(send) {
    async function handler() {
      const roomList = await db.query.rooms.findMany({
        where: eq(rooms.userId, userId || ""),
      });

      send({ event: userId!, data: JSON.stringify(roomList) });
    }

    // Initial fetch
    db.query.rooms
      .findMany({
        where: eq(rooms.userId, userId || ""),
      })
      .then((roomList) => {
        send({ event: userId!, data: JSON.stringify(roomList) });
      });

    emitter.on("roomlist", handler);

    return function clear() {
      emitter.off("roomlist", handler);
    };
  });
}
