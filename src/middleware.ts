import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { validateRequest } from "./server/unkey";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env.mjs";

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    Number(env.UPSTASH_RATELIMIT_REQUESTS),
    `${Number(env.UPSTASH_RATELIMIT_SECONDS)}s`
  ),
  analytics: true,
});

export default authMiddleware({
  publicRoutes: ["/", "/api/public/(.*)"],
  afterAuth: async (auth, req) => {
    if (!auth.userId && auth.isPublicRoute) {
      const { success } = await rateLimit.limit(req.ip || "");
      if (success) {
        return NextResponse.next();
      }
      return new NextResponse("TOO MANY REQUESTS", {
        status: 429,
        statusText: "Too many requests!",
      });
    }

    if (
      req.nextUrl.pathname.includes("/api/webhooks") ||
      req.nextUrl.pathname.includes("/api/private")
    ) {
      const { success } = await rateLimit.limit(req.ip || "");

      const isValid = await validateRequest(req);
      if (isValid && success) {
        return NextResponse.next();
      } else if (!success) {
        return new NextResponse("TOO MANY REQUESTS", {
          status: 429,
          statusText: "Too many requests!",
        });
      } else if (!isValid) {
        return new NextResponse("UNAUTHORIZED", {
          status: 403,
          statusText: "Unauthorized!",
        });
      }
    }

    if (!auth.userId && !auth.isPublicRoute) {
      // This is annoying...
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
