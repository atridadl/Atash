import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/api";
import { getAuth } from "@clerk/nextjs/server";
import { TRPCError, type inferAsyncReturnType, initTRPC } from "@trpc/server";
import { db } from "../db";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import superjson from "superjson";

interface AuthContext {
  auth: SignedInAuthObject | SignedOutAuthObject;
}

const createInnerTRPCContext = ({ auth }: AuthContext) => {
  return {
    auth,
    db,
  };
};

export const createTRPCContext = ({ req }: FetchCreateContextFnOptions) => {
  return createInnerTRPCContext({ auth: getAuth(req as NextRequest) });
};

export type Context = inferAsyncReturnType<typeof createTRPCContext>;

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
// check if the user is signed in, otherwise through a UNAUTHORIZED CODE
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
