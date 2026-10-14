// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

const APP_PREFIXES = ["/app"];
const ADMIN_PREFIXES = ["/dashboard", "/agent"];
const AUTH_PREFIXES = ["/sign-in", "/sign-up"];

const PUBLIC_API_PREFIXES = [
  "/api/webhooks",
  "/api/trpc",
  "/api/safepay",
  "/api/payment-confirm",
];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();

  return ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.trim().toLowerCase() === normalizedEmail,
  );
}

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Public API endpoints handle their own authorization.
  // Webhooks must verify their signatures inside their route handlers.
  if (matchesPrefix(pathname, PUBLIC_API_PREFIXES)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  const isLoggedIn = Boolean(userId);
  const isAppRoute = matchesPrefix(pathname, APP_PREFIXES);
  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);
  const isAuthRoute = matchesPrefix(pathname, AUTH_PREFIXES);

  // Logged-in users never see the landing page or auth pages -> go to /app.
  if (isLoggedIn && (pathname === "/" || isAuthRoute)) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // Logged-out users cannot access /app or admin routes.
  if (!isLoggedIn && (isAppRoute || isAdminRoute)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Admin-only routes: /dashboard and /agent.
  if (isAdminRoute && userId) {
    let role = (
      sessionClaims?.metadata as { role?: string } | undefined
    )?.role;

    // Fast path: role already in the session token.
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      if (!role) {
        role = (user.publicMetadata as { role?: string } | undefined)?.role;
      }

      const email =
        user.emailAddresses.find(
          (item) => item.id === user.primaryEmailAddressId,
        )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

      const isAdmin = role === "ADMIN" || isAdminEmail(email);

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/app", req.url));
      }
    } catch (error) {
      console.error("[NARRO Proxy] Admin verification failed:", error);
      // Fail closed: if we cannot verify, do not allow access.
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // Always run for Clerk's auto-proxy path.
    "/__clerk/:path*",

    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};