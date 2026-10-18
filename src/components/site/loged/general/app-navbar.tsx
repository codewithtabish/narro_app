"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bell,
  ChevronDown,
  Command,
  CreditCard,
  LogOut,
  Search,
  Settings,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ModeToggle } from "@/components/site/general/theme/mode-toggle";
import { cn } from "@/lib/utils";
import { UserPlanBadge } from "./user-plan-badge";

/* -------------------------------------------------------------------------- */
/*  Nav links (desktop)                                                        */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Home", href: "/app" },
  { label: "Calls", href: "/app/calls" },
  { label: "Rooms", href: "/app/rooms" },
  { label: "AI", href: "/app/ai" },
] as const;

/* -------------------------------------------------------------------------- */
/*  App Navbar                                                                 */
/*                                                                             */
/*  NOTE: `usePathname()` is runtime-only data on dynamic routes like          */
/*  /app/calls/[id]. It must live in a component wrapped in <Suspense>, so     */
/*  AppNavbar itself never calls it. Only <NavLinks /> and                     */
/*  <CloseOnRouteChange /> do, and both are wrapped below.                     */
/* -------------------------------------------------------------------------- */

export function AppNavbar() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const closeUserMenu = React.useCallback(() => setUserMenuOpen(false), []);

  /* -------- Scroll shadow -------- */
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* -------- Close user menu on outside click -------- */
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        userMenuRef.current &&
        target &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  /* -------- Close on Escape -------- */
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [userMenuOpen]);

  /* -------- Cmd/Ctrl+K → focus search -------- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const initial =
    user?.firstName?.[0]?.toUpperCase() ??
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ??
    "U";

  return (
    <header
      data-slot="app-navbar"
      className={cn(
        "sticky top-0 z-40 w-full",
        "transition-colors duration-300",
        scrolled
          ? "bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"
          : "bg-transparent",
      )}
    >
      {/* Closes the user menu whenever the route changes (renders nothing) */}
      <React.Suspense fallback={null}>
        <CloseOnRouteChange onRouteChange={closeUserMenu} />
      </React.Suspense>

      <nav
        aria-label="App primary"
        className="flex h-16 items-center justify-between gap-4"
      >
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LEFT — brand                                                */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Link
          href="/app"
          aria-label="NARRO — Home"
          className="group inline-flex shrink-0 items-baseline gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="font-serif text-xl font-semibold uppercase tracking-[0.18em] text-primary transition-opacity duration-300 group-hover:opacity-80">
            Narro
          </span>
        </Link>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CENTER — nav links + search                                 */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
          {/* Fallback renders the same links with no active state, so   */}
          {/* there is no layout shift when the pathname streams in.     */}
          <React.Suspense fallback={<NavLinkList pathname={null} />}>
            <NavLinks />
          </React.Suspense>

          <div className="ml-2 hidden xl:block">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2}
                aria-hidden="true"
              />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search people, rooms, topics…"
                aria-label="Search"
                className={cn(
                  "h-9 w-[280px] rounded-full bg-secondary pl-9 pr-20 text-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/40",
                  "focus:w-[340px] focus:bg-background",
                )}
              />
              <kbd
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
                  "inline-flex h-6 items-center gap-0.5 rounded-md",
                  "bg-background px-1.5 text-[10px] font-medium text-muted-foreground",
                  "border border-border/60",
                )}
              >
                <Command className="h-3 w-3" strokeWidth={2.5} />
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RIGHT — plan badge + theme + actions + user menu            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* ── Plan + AI minutes badge ── */}
          <React.Suspense fallback={<UserPlanBadgeFallback />}>
            <UserPlanBadge />
          </React.Suspense>

          {/* ── Theme toggle (light / dark) ── */}
          <ModeToggle />

          {/* Mobile search shortcut */}
          <button
            type="button"
            aria-label="Search"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full xl:hidden",
              "text-muted-foreground transition-colors duration-200",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className={cn(
              "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
              "text-muted-foreground transition-colors duration-200",
              "hover:bg-secondary hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 inline-block h-2 w-2 rounded-full bg-primary ring-2 ring-background"
            />
          </button>

          {/* User menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              aria-label="Open user menu"
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              onClick={() => setUserMenuOpen((v) => !v)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-2 sm:pr-3",
                "transition-colors duration-200",
                "hover:bg-secondary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                userMenuOpen && "bg-secondary",
              )}
            >
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt={user.fullName ?? "User avatar"}
                  className="h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initial}
                </span>
              )}
              <span className="hidden max-w-[120px] truncate text-sm font-medium text-foreground sm:inline">
                {user?.firstName ?? "You"}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  userMenuOpen && "rotate-180",
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                className={cn(
                  "absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden",
                  "rounded-2xl border border-border bg-popover/95 backdrop-blur-xl",
                  "shadow-[0_20px_40px_-16px_rgba(0,0,0,0.18)]",
                )}
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="truncate text-sm font-medium text-popover-foreground">
                    {user?.fullName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>

                <ul className="py-1.5">
                  <MenuItem
                    href="/app/profile"
                    Icon={UserIcon}
                    label="Profile"
                    onNavigate={closeUserMenu}
                  />
                  <MenuItem
                    href="/app/settings"
                    Icon={Settings}
                    label="Settings"
                    onNavigate={closeUserMenu}
                  />
                  <MenuItem
                    href="/app/upgrade"
                    Icon={CreditCard}
                    label="Subscription"
                    onNavigate={closeUserMenu}
                  />
                </ul>

                <div className="border-t border-border py-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut({ redirectUrl: "/" });
                    }}
                    className={cn(
                      "mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-lg px-3 py-2",
                      "text-sm text-popover-foreground/85",
                      "transition-colors duration-150",
                      "hover:bg-accent hover:text-foreground",
                      "focus-visible:outline-none focus-visible:bg-accent",
                    )}
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pathname-dependent pieces (must be rendered inside <Suspense>)             */
/* -------------------------------------------------------------------------- */

/** Reads the pathname and passes it to the link list. */
function NavLinks() {
  const pathname = usePathname();
  return <NavLinkList pathname={pathname} />;
}

/** Calls `onRouteChange` whenever the pathname changes. Renders nothing. */
function CloseOnRouteChange({ onRouteChange }: { onRouteChange: () => void }) {
  const pathname = usePathname();

  React.useEffect(() => {
    onRouteChange();
  }, [pathname, onRouteChange]);

  return null;
}

/* -------------------------------------------------------------------------- */
/*  NavLinkList — pure markup, used by both the fallback and the real links    */
/*  `pathname = null` means "unknown yet" → no active state.                   */
/* -------------------------------------------------------------------------- */

function NavLinkList({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const isActive =
          pathname !== null &&
          (link.href === "/app"
            ? pathname === "/app"
            : pathname === link.href || pathname.startsWith(`${link.href}/`));

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fallback while plan badge loads                                            */
/* -------------------------------------------------------------------------- */

function UserPlanBadgeFallback() {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hidden h-9 items-center gap-2 rounded-full px-3 sm:inline-flex",
        "bg-secondary/60",
      )}
    >
      <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-border" />
      <span className="h-2.5 w-12 animate-pulse rounded bg-border" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MenuItem                                                                   */
/* -------------------------------------------------------------------------- */

function MenuItem({
  href,
  Icon,
  label,
  onNavigate,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        onClick={onNavigate}
        className={cn(
          "mx-1 flex items-center gap-3 rounded-lg px-3 py-2",
          "text-sm text-popover-foreground/85",
          "transition-colors duration-150",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:bg-accent",
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </Link>
    </li>
  );
}