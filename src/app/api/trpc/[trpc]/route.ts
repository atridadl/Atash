import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "~/server/trpc";
import { createTRPCContext } from "~/server/trpc/trpc";

export const runtime = "edge";
export const preferredRegion = ["pdx1"];

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    batching: {
      enabled: false,
    },
  });

export { handler as GET, handler as POST };
