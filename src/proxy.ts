// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

const ADMIN_PREFIXES = ["/dashboard", "/agent"];

// ✅ Protected Routes (Requires Login)
const PROTECTED_PREFIXES = [
  "/app", 
  "/rooms/active", 
  "/community/active"
];

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

  // ── ADMIN PROTECTION ──
  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);

  if (isAdminRoute) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    let role = (
      sessionClaims?.metadata as { role?: string } | undefined
    )?.role;

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
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // ── ✅ PROTECT ACTIVE ROOMS & COMMUNITY CALLS ──
  const isProtectedRoute = matchesPrefix(pathname, PROTECTED_PREFIXES);

  if (isProtectedRoute && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    // After login, redirect them straight back to the room/call
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── EVERYTHING ELSE IS PUBLIC ──
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};