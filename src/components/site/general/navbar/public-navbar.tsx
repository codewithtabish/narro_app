// src/components/public/public-navbar.tsx
"use client";

import { SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "../theme/mode-toggle";

/* -------------------------------------------------------------------------- */
/*  Nav items                                                                  */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Community", href: "/community" },
  { label: "Rooms", href: "/rooms" },
  { label: "LiveStreams", href: "/live-stream" },
  { label: "Pricing", href: "/pricing" },
] as const;

/* -------------------------------------------------------------------------- */
/*  PublicNavbar                                                               */
/* -------------------------------------------------------------------------- */
export function PublicNavbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ── Check if we are in an active call, room, or live stream ────────────── */
  // If the URL is /community/active/... OR /rooms/active/... OR /live-stream/...
  // we hide the navbar for a fully immersive experience.
  const isImmersivePage = 
    pathname?.startsWith("/community/active/") || 
    pathname?.startsWith("/rooms/active/") ||
    pathname?.startsWith("/live-stream/"); // ✅ Added live-stream

  /* ── Subtle shadow on scroll ───────────────────────────── */
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close menu on desktop resize ──────────────────────── */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Lock scroll when mobile menu open ─────────────────── */
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMenuOpen]);

  /* ── HIDE THE NAVBAR IN IMMERSIVE PAGES ──────────────────── */
  if (isImmersivePage) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-border",
        "bg-background/85 backdrop-blur-xl",
        "transition-shadow duration-200",
        isScrolled && "shadow-sm"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"
      >
        {/* ── LEFT — NARRO wordmark ─────────────────────────── */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="shrink-0 font-serif text-[22px] font-normal tracking-[-0.02em] text-foreground sm:text-[24px]"
        >
          NARRO
        </Link>

        {/* ── CENTER — nav links (desktop) ──────────────────── */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-[15px] font-medium transition-colors",
                    isActive
                      ? "text-primary underline decoration-primary decoration-2 underline-offset-8"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── RIGHT — desktop ───────────────────────────────── */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ModeToggle />

          {!isLoaded ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            <UserButton
              appearance={{ elements: { avatarBox: "h-9 w-9" } }}
            />
          ) : (
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-6",
                  "bg-primary text-[14px] font-semibold text-primary-foreground",
                  "shadow-sm transition-all duration-200",
                  "hover:bg-primary/90",
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                )}
              >
                Get started
              </button>
            </SignUpButton>
          )}
        </div>

        {/* ── RIGHT — mobile ────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ModeToggle />

          {!isLoaded ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isSignedIn ? (
            <UserButton
              appearance={{ elements: { avatarBox: "h-8 w-8" } }}
            />
          ) : (
            <SignUpButton mode="modal">
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-4",
                  "bg-primary text-[13px] font-semibold text-primary-foreground",
                  "shadow-sm active:scale-[0.98]"
                )}
              >
                Get started
              </button>
            </SignUpButton>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              "text-foreground",
              "transition-colors hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            )}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU PANEL ───────────────────────────────── */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className={cn(
              "border-t border-border bg-background",
              "px-5 py-4 sm:px-8"
            )}
          >
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "block py-3 text-[16px] font-medium transition-colors",
                        isActive
                          ? "text-primary underline decoration-primary decoration-2 underline-offset-4"
                          : "text-foreground hover:text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}