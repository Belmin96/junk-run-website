import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/",
  "/jobs(.*)",
  "/contractors(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/legal(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!isPublic(req) && !userId) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (req.nextUrl.pathname.startsWith("/api/app-only")) {
    return NextResponse.json(
      { error: "This action is available in the Junk Run mobile app." },
      { status: 403 }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https:"
  );
  return response;
});

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
