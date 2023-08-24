import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
  regions: ["pdx1"],
  unstable_allowDynamic: ["/node_modules/ably/**"],
};

export default async function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: createTRPCContext,
  });
}
