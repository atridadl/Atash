import { EventEmitter } from "events";
import { pub, publishToChannel, subscribeToChannel } from "./redis.server";

let emitter: EventEmitter;

declare global {
  var __emitter: EventEmitter | undefined;
}

if (process.env.NODE_ENV === "production") {
  emitter = new EventEmitter();
} else {
  if (!global.__emitter) {
    global.__emitter = new EventEmitter();
  }
  emitter = global.__emitter;
}

if (process.env.REDIS_URL) {
  subscribeToChannel("nodes", (message: string) => {
    console.log(`RECEIVED ${message} EVENT FROM ANOTHER NODE!`);
    if (message === "roomlist") emitter.emit("roomlist");
    else if (message === "votes") emitter.emit("votes");
    else if (message === "presence") emitter.emit("presence");
    else if (message === "room") emitter.emit("room");
  });

  emitter.on("nodes", async (message: string) => {
    await publishToChannel("nodes", message);
  });
}

export { emitter };
