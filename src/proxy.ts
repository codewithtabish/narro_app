// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

const ADMIN_PREFIXES = ["/dashboard", "/agent"];
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
  if (matchesPrefix(pathname, PUBLIC_API_PREFIXES)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // ── ADMIN PROTECTION ONLY ──
  // We only protect /dashboard and /agent. Everything else is public.
  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);

  if (isAdminRoute) {
    if (!userId) {
      // Redirect logged-out users to sign-in if they try to access admin
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

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
        // Non-admins trying to access admin routes get sent to the app
        return NextResponse.redirect(new URL("/app", req.url));
      }
    } catch (error) {
      console.error("[NARRO Proxy] Admin verification failed:", error);
      // Fail closed: if we cannot verify, do not allow access.
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // ── EVERYTHING ELSE IS PUBLIC ──
  // We explicitly do NOT redirect logged-in users away from "/" or "/sign-in".
  // We do NOT redirect logged-out users away from "/app" or "/community".
  // The Client Components and Server Actions handle the authentication gates.
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