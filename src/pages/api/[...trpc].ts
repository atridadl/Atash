import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { createNextApiHandler } from "@trpc/server/adapters/next";

export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
