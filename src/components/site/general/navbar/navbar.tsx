"use client";

import { ModeToggle } from "@/components/site/general/theme/mode-toggle";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, useClerk, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Nav links                                                                  */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  /* ------------------------------------------------------------------ */
  /*  Reset mobile menu when the route changes                          */
  /*  Uses the "adjust state during render" pattern — React's official  */
  /*  recommendation for resetting state when a value changes.          */
  /*  Avoids setState inside useEffect (React 19 lint rule).            */
  /* ------------------------------------------------------------------ */
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  /* ------------------------------------------------------------------ */
  /*  Detect scroll for backdrop blur intensity                          */
  /* ------------------------------------------------------------------ */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Lock body scroll when mobile drawer is open                       */
  /* ------------------------------------------------------------------ */
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* ------------------------------------------------------------------ */
  /*  Close drawer on Escape key                                        */
  /* ------------------------------------------------------------------ */
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <header
      data-slot="marketing-navbar"
      className={cn(
        "sticky top-0 z-50 w-full border-0",
        "transition-colors duration-300",
        scrolled
          ? "bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="flex h-16 items-center justify-between gap-4 border-0"
      >
        {/* ============================================================ */}
        {/* LEFT — brand                                                 */}
        {/* ============================================================ */}
        <Link
          href="/"
          aria-label="NARRO — Home"
          className="group inline-flex shrink-0 items-baseline gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="font-serif text-xl font-semibold uppercase tracking-[0.18em] text-primary transition-opacity duration-300 group-hover:opacity-80 sm:text-2xl">
            Narro
          </span>
        </Link>

        {/* ============================================================ */}
        {/* CENTER — desktop nav links                                   */}
        {/* ============================================================ */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ============================================================ */}
        {/* RIGHT — theme + auth + CTA                                   */}
        {/* ============================================================ */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ModeToggle />

          {/* Signed out — Sign in text link + Download button */}
          {!isSignedIn && (
            <>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/app"
                signUpForceRedirectUrl="/app"
              >
                <button
                  type="button"
                  className={cn(
                    "hidden h-9 items-center rounded-full px-4 text-sm font-medium sm:inline-flex",
                    "text-foreground/80 transition-colors duration-200",
                    "hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton
                mode="modal"
                forceRedirectUrl="/app"
                signInForceRedirectUrl="/app"
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-4 sm:px-5",
                    "bg-primary text-primary-foreground",
                    "text-sm font-semibold",
                    "shadow-sm transition-colors duration-200",
                    "hover:bg-primary/90",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <span className="hidden sm:inline">Download app</span>
                  <span className="sm:hidden">Get app</span>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </SignUpButton>
            </>
          )}

          {/* Signed in — dashboard link + sign out */}
          {isSignedIn && (
            <>
              <Link
                href="/app"
                className={cn(
                  "hidden h-9 items-center rounded-full px-4 text-sm font-medium sm:inline-flex",
                  "text-foreground/80 transition-colors duration-200",
                  "hover:text-foreground",
                )}
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/" })}
                className={cn(
                  "hidden h-9 items-center rounded-full px-4 text-sm font-medium sm:inline-flex",
                  "text-muted-foreground transition-colors duration-200",
                  "hover:text-foreground",
                )}
              >
                Sign out
              </button>

              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "User avatar"}
                  className="hidden h-9 w-9 rounded-full border border-border object-cover sm:inline-block"
                />
              ) : (
                <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:inline-flex">
                  {user?.firstName?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-menu"
            onClick={() => setMobileOpen((v) => !v)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden",
              "text-foreground/80 transition-colors duration-200",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* MOBILE DRAWER                                                 */}
      {/* ============================================================ */}
      <div
        id="marketing-mobile-menu"
        aria-hidden={!mobileOpen}
        className={cn(
          "overflow-hidden border-t border-border/60 lg:hidden",
          "bg-background/95 backdrop-blur-xl",
          "transition-[max-height,opacity] duration-300 ease-out",
          mobileOpen
            ? "max-h-[80vh] opacity-100"
            : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col py-4">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex h-12 items-center rounded-xl px-2 text-base font-medium",
                      "transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-foreground/80 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Auth actions in drawer (only when signed out) */}
          {!isSignedIn && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
              <SignInButton
                mode="modal"
                forceRedirectUrl="/app"
                signUpForceRedirectUrl="/app"
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-full",
                    "bg-secondary text-foreground text-sm font-semibold",
                    "transition-colors duration-200 hover:bg-secondary/80",
                  )}
                >
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton
                mode="modal"
                forceRedirectUrl="/app"
                signInForceRedirectUrl="/app"
              >
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-1.5 rounded-full",
                    "bg-primary text-primary-foreground text-sm font-semibold",
                    "shadow-sm transition-colors duration-200 hover:bg-primary/90",
                  )}
                >
                  Download app
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </SignUpButton>
            </div>
          )}

          {/* Signed-in actions in drawer */}
          {isSignedIn && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
              <Link
                href="/app"
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground text-sm font-semibold",
                  "shadow-sm transition-colors duration-200 hover:bg-primary/90",
                )}
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/" })}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-full",
                  "bg-secondary text-foreground text-sm font-semibold",
                  "transition-colors duration-200 hover:bg-secondary/80",
                )}
              >
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}