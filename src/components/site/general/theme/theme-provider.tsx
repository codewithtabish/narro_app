"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

// next-themes renders an inline <script> to set the theme class before
// hydration, which prevents a flash of the wrong theme on load. React 19
// now warns whenever a <script> tag is rendered inside a component tree —
// but the script still runs correctly during SSR, so this is a known
// false positive (see https://github.com/pacocoursey/next-themes/issues/385
// and https://github.com/shadcn-ui/ui/issues/10104). next-themes hasn't
// been updated in over a year, so this is filtered here rather than fixed
// upstream.
//
// We also suppress hydration mismatch warnings caused by browser extensions
// (especially Dark Reader) that inject attributes like
// data-darkreader-inline-stroke into SVGs after the server HTML is sent.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    // 1. next-themes script tag false positive
    if (message.includes("Encountered a script tag")) {
      return;
    }

    // 2. Dark Reader / browser extension hydration mismatches
    if (
      message.includes("Hydration") ||
      message.includes("hydration") ||
      message.includes("server rendered HTML") ||
      message.includes("did not match") ||
      message.includes("A tree hydrated but some attributes")
    ) {
      return;
    }

    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
