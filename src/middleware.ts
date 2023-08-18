import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { validateRequest } from "./server/unkey";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/public/(.*)"],
  afterAuth: async (auth, req) => {
    if (!auth.userId && auth.isPublicRoute) {
      return NextResponse.next();
    }

    if (
      req.nextUrl.pathname.includes("/api/webhooks") ||
      req.nextUrl.pathname.includes("/api/private")
    ) {
      const isValid = await validateRequest(req);
      if (isValid) {
        return NextResponse.next();
      } else {
        return new NextResponse("UNAUTHORIZED", { status: 403 });
      }
    }
    if (!auth.userId && !auth.isPublicRoute) {
      redirectToSignIn({ returnBackUrl: req.url });
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
