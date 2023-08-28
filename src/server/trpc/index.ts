import { createTRPCRouter } from "./trpc";
import { roomRouter } from "./routers/room";
import { voteRouter } from "./routers/vote";

export const appRouter = createTRPCRouter({
  room: roomRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;
