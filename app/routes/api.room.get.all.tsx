import { getAuth } from "@clerk/remix/ssr.server";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { eventStream } from "remix-utils/sse/server";
import { db } from "~/services/db.server";
import { emitter } from "~/services/emitter.server";
import { fetchCache, setCache } from "~/services/redis.server";
import { rooms } from "~/services/schema.server";

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
      fetchCache<
        {
          id: string;
          createdAt: Date;
          roomName: string;
        }[]
      >(`kv_roomlist_${userId}`, "atash").then((cachedResult) => {
        if (cachedResult) {
          send({ event: userId!, data: JSON.stringify(cachedResult) });
        } else {
          db.query.rooms
            .findMany({
              where: eq(rooms.userId, userId || ""),
            })
            .then((roomList) => {
              Promise.all([
                setCache(`kv_roomlist_${userId}`, roomList, "atash"),
                send({ event: userId!, data: JSON.stringify(roomList) }),
              ]);
            });
        }
      });
    }

    // Initial fetch
    fetchCache<
      {
        id: string;
        createdAt: Date;
        roomName: string;
      }[]
    >(`kv_roomlist_${userId}`, "atash").then((cachedResult) => {
      if (cachedResult) {
        send({ event: userId!, data: JSON.stringify(cachedResult) });
      } else {
        db.query.rooms
          .findMany({
            where: eq(rooms.userId, userId || ""),
          })
          .then((roomList) => {
            Promise.all([
              setCache(`kv_roomlist_${userId}`, roomList, "atash"),
              send({ event: userId!, data: JSON.stringify(roomList) }),
            ]);
          });
      }
    });

    emitter.on("roomlist", handler);

    return function clear() {
      emitter.off("roomlist", handler);
    };
  });
}
