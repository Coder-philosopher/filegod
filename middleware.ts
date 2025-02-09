import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public Pages (No Auth Required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
]);

// Public API Routes (No Auth Required)
const isPublicApiRoute = createRouteMatcher([
  "/api/videos",
]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const currentUrl = new URL(req.url);
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // 🟢 Always allow access to the landing page ("/")
  if (currentUrl.pathname === "/") {
    return NextResponse.next();
  }

  // 🟢 If the user is logged in and trying to access Sign In / Sign Up, redirect them to the dashboard
  if (userId && (currentUrl.pathname === "/sign-in" || currentUrl.pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 🔴 If the user is NOT logged in and trying to access a protected route, redirect to Sign In
  if (!userId && !isPublicRoute(req) && !isPublicApiRoute(req)) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // 🔴 If the user is NOT logged in and trying to access a protected API, block access
  if (!userId && isApiRequest && !isPublicApiRoute(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
