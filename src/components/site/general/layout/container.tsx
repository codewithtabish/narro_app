import * as React from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Container — ALENTAH
 *
 * Public-site container only.
 * Admin routes must use src/app/admin/layout.tsx instead.
 *
 * Layout contract:
 *   - Passive wrapper: background, ambient glows.
 *   - Does NOT force min-height and does NOT create a flex column.
 *   - ALL ambient effects live in ONE `fixed inset-0 overflow-hidden`
 *     overlay. Fixed + clipped means the glows can never add document
 *     height (no blank space under the footer) and always stay on
 *     screen while the page scrolls.
 *   - Horizontal padding + max-width live on the CONTENT wrapper, so
 *     the background and the glows still bleed edge-to-edge on wide
 *     screens while the readable content stays centered.
 *   - Content sits in its own z-10 wrapper, so `sticky` / `fixed`
 *     elements inside pages keep working.
 *
 * Theme:
 *   - Uses shadcn's `--primary` (Tailwind v4 / oklch style, where the
 *     variable holds a full colour).
 *   - Glow strength is set by four CSS variables on the overlay, with
 *     separate light and dark values (light is stronger, because a
 *     tint on a light background needs more colour to be visible).
 *
 * Dark-mode text:
 *   - Inside this container, `--foreground` is overridden in dark mode
 *     with a softer off-white. Everything using `text-foreground`
 *     (headings, body, icons) inherits it, so text no longer glares.
 *     Needs shadcn's `@theme inline` setup (the default).
 *
 * Motion:
 *   - Pure CSS (no JS, no client component needed).
 *   - Glows drift and breathe slowly; the overlay fades in on mount.
 *   - Fully disabled for users with "reduce motion" enabled.
 *
 * Note: `fixed` anchors to the viewport only if no ancestor has a
 * transform/filter. If a page-transition wrapper above this has one,
 * change `fixed` to `absolute` on the overlay.
 */

const KEYFRAMES = `
@keyframes alentah-glow-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: .88; }
  50%      { transform: translate3d(5%, 7%, 0) scale(1.12); opacity: 1; }
}
@keyframes alentah-glow-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); opacity: .85; }
  50%      { transform: translate3d(-7%, -6%, 0) scale(.94); opacity: 1; }
}
@keyframes alentah-glow-c {
  0%, 100% { transform: translate3d(0, 0, 0) scale(.98); opacity: .85; }
  50%      { transform: translate3d(6%, -8%, 0) scale(1.1); opacity: 1; }
}
@keyframes alentah-wash {
  0%, 100% { opacity: .85; }
  50%      { opacity: 1; }
}
@keyframes alentah-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

export function Container({
  children,
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(
        // ============================================================
        // BASE — full-bleed background, no padding here
        // ============================================================
        "relative isolate w-full antialiased",
        "bg-background text-foreground",
        "transition-colors duration-500 ease-out",

        // ============================================================
        // DARK MODE — softer text (override --foreground for this tree)
        // Tweak the lightness (0.86) up for brighter, down for dimmer.
        // ============================================================
        "dark:[--foreground:oklch(0.86_0.008_90)]",

        className,
      )}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* ============================================================
          AMBIENT BACKGROUND — one clipped, fixed, non-interactive layer
          ------------------------------------------------------------
          --glow-wash / --glow-top / --glow-bottom / --glow-left
          = glow strength. Light values first, dark values after `dark:`.
          Raise the numbers for a stronger glow, lower for subtler.
          ============================================================ */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 overflow-hidden",
          "[--glow-wash:7%] [--glow-top:14%] [--glow-bottom:11%] [--glow-left:9%]",
          "dark:[--glow-wash:7%] dark:[--glow-top:12%] dark:[--glow-bottom:9%] dark:[--glow-left:7%]",
          "animate-[alentah-fade-in_1200ms_ease-out_both]",
          "motion-reduce:animate-none",
        )}
      >
        {/* Soft top wash (full width) */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-[radial-gradient(ellipse_100%_55%_at_50%_-10%,color-mix(in_oklab,var(--primary)_var(--glow-wash),transparent),transparent_62%)]",
            "animate-[alentah-wash_14s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
          )}
        />

        {/* Top-center glow */}
        <div className="absolute inset-x-0 top-[-15%] flex justify-center">
          <div
            className={cn(
              "h-[400px] w-[400px]",
              "sm:h-[550px] sm:w-[550px]",
              "lg:h-[700px] lg:w-[700px]",
              "rounded-full will-change-transform",
              "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_var(--glow-top),transparent),transparent_70%)]",
              "animate-[alentah-glow-a_24s_ease-in-out_infinite]",
              "motion-reduce:animate-none",
            )}
          />
        </div>

        {/* Left-middle glow (balances the composition) */}
        <div
          className={cn(
            "absolute left-[-18%] top-[32%]",
            "h-[300px] w-[300px]",
            "sm:h-[400px] sm:w-[400px]",
            "lg:h-[520px] lg:w-[520px]",
            "rounded-full will-change-transform",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_var(--glow-left),transparent),transparent_70%)]",
            "animate-[alentah-glow-c_28s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
          )}
        />

        {/* Bottom-right glow */}
        <div
          className={cn(
            "absolute bottom-[-20%] right-[-10%]",
            "h-[350px] w-[350px]",
            "sm:h-[450px] sm:w-[450px]",
            "lg:h-[600px] lg:w-[600px]",
            "rounded-full will-change-transform",
            "bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_var(--glow-bottom),transparent),transparent_70%)]",
            "animate-[alentah-glow-b_30s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
          )}
        />
      </div>

      {/* ============================================================
          CONTENT — max-width + responsive padding live HERE so the
          background and glows still bleed edge-to-edge.
          ============================================================ */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full",
          // Max width — content never grows wider than this on big screens
          "max-w-[1400px]",
          // Responsive horizontal padding — generous on large screens
          "px-4", // mobile  → 16px
          "sm:px-6", // sm     → 24px
          "md:px-8", // md     → 32px
          "lg:px-12", // lg     → 48px
          "xl:px-16", // xl     → 64px
          "2xl:px-20", // 2xl+  → 80px
        )}
      >
        {children}
      </div>
    </div>
  );
}