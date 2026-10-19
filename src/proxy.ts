// src/proxy.ts

import { clerkClient, clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ADMIN_EMAILS } from "@/lib/admin-emails";

const ADMIN_PREFIXES = ["/dashboard", "/agent"];
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

  if (matchesPrefix(pathname, PUBLIC_API_PREFIXES)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // ── ADMIN PROTECTION ──
  const isAdminRoute = matchesPrefix(pathname, ADMIN_PREFIXES);

  if (isAdminRoute) {
    if (!userId) {
      // Since you use Modals, send them to the home page, they'll see the admin lock
      return NextResponse.redirect(new URL("/", req.url));
    }

    let role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
    if (role === "ADMIN") return NextResponse.next();

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

  // ── ✅ PROTECT ACTIVE ROOMS & CALLS (MODAL APPROACH) ──
  const isProtectedRoute = matchesPrefix(pathname, PROTECTED_PREFIXES);

  if (isProtectedRoute && !userId) {
    // Since you don't have a /sign-in page, we redirect them back to the room list.
    // The `RoomCard` (which we updated earlier) will handle showing the Clerk Modal.
    return NextResponse.redirect(new URL("/rooms", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};