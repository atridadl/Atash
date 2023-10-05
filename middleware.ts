import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { validateRequest } from "./app/_lib/unkey";
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
  ignoredRoutes: ["/"],
  publicRoutes: [
    "/api/external/public/(.*)",
    "/api/webhooks",
    "/api/webhooks/(.*)",
  ],
  apiRoutes: ["/api/external/private/(.*)", "/api/internal/(.*)"],
  beforeAuth: async (req) => {
    const { success } = await rateLimit.limit(req.ip || "");
    if (success) {
      if (req.nextUrl.pathname.includes("/api/external/private")) {
        const isValid = await validateRequest(req);

        if (!isValid) {
          return new NextResponse("UNAUTHORIZED", {
            status: 403,
            statusText: "Unauthorized!",
          });
        }
      }
      return NextResponse.next();
    }

    return new NextResponse("TOO MANY REQUESTS", {
      status: 429,
      statusText: "Too many requests!",
    });
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};
