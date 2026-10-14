"use client";

import { cn } from "@/lib/utils";
import { Home, Mic, Phone, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Tab config — matches mobile app exactly: Home · Calls · Rooms · AI · Profile */
/* -------------------------------------------------------------------------- */

const TABS = [
  { label: "Home",    href: "/app",         Icon: Home },
  { label: "Calls",   href: "/app/calls",   Icon: Phone },
  { label: "Rooms",   href: "/app/rooms",   Icon: Mic },
  { label: "AI",      href: "/app/ai",      Icon: Sparkles },
  { label: "Profile", href: "/app/profile", Icon: User },
] as const;

/* -------------------------------------------------------------------------- */
/*  AppTabBar                                                                  */
/* -------------------------------------------------------------------------- */

export function AppTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App bottom navigation"
      className={cn(
        // Mobile-only — desktop uses the top navbar
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        // Frosted glass surface — same technique as navbar
        "border-t border-border/60 bg-background/80 backdrop-blur-xl",
        // iOS safe area
        "pb-[env(safe-area-inset-bottom)]",
      )}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {TABS.map(({ label, href, Icon }) => {
          const isActive =
            href === "/app"
              ? pathname === "/app"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={cn(
                  "group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* Icon — with soft active pill */}
                <span
                  className={cn(
                    "inline-flex h-9 w-14 items-center justify-center rounded-full",
                    "transition-colors duration-200",
                    isActive ? "bg-primary/10" : "bg-transparent",
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden="true"
                  />
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] leading-none tracking-wide",
                    isActive ? "font-semibold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}