import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { validateRequest } from "./app/_lib/unkey";
import { NextResponse } from "next/server";

export default authMiddleware({
  ignoredRoutes: ["/"],
  publicRoutes: [
    "/api/external/public/(.*)",
    "/api/webhooks",
    "/api/webhooks/(.*)",
  ],
  afterAuth: async (auth, req) => {
    if (!auth.userId && auth.isPublicRoute) {
      return NextResponse.next();
    }

    if (req.nextUrl.pathname.includes("/api/internal")) {
      if (auth.userId) {
        return NextResponse.next();
      } else {
        return new NextResponse("UNAUTHORIZED", {
          status: 403,
          statusText: "Unauthorized!",
        });
      }
    }

    if (req.nextUrl.pathname.includes("/api/external/private")) {
      const isValid = await validateRequest(req);

      if (isValid) {
        return NextResponse.next();
      } else {
        return new NextResponse("UNAUTHORIZED", {
          status: 403,
          statusText: "Unauthorized!",
        });
      }
    }

    if (!auth.userId && !auth.isPublicRoute) {
      if (req.nextUrl.pathname.includes("/api")) {
        return NextResponse.next();
      }
      // This is annoying...
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api)(.*)"],
};
