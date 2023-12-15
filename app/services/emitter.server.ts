import { EventEmitter } from "events";
import { publishToChannel, subscribeToChannel } from "./redis.server";
import "dotenv/config";

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
    console.log(`[MULTI-NODE] RECEIVED ${message} EVENT FROM ANOTHER NODE!`);
    const parsedMessage = message.split('"')[1];
    emitter.emit(parsedMessage);
  });

  emitter.on("nodes", async (message: string) => {
    emitter.emit(message);
    await publishToChannel("nodes", message);
  });
} else {
  emitter.on("nodes", async (message: string) => {
    console.log(`[SINGLE NODE] RECEIVED ${message} EVENT!`);
    emitter.emit(message);
  });
}

export { emitter };
