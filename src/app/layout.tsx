// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import {
  Fraunces,
  Geist_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/site/general/theme/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

// ============================================
// FONTS
// ============================================
// next/font/google self-hosts these fonts at build time,
// so no external preconnect / dns-prefetch hints are needed
// for fonts.googleapis.com or fonts.gstatic.com.

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: ["normal"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
});

const fontSerif = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: true,
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["monospace"],
  adjustFontFallback: true,
});

// ============================================
// SITE CONSTANTS
// ============================================

const SITE_URL = "https://www.alentah.com";
const SITE_NAME = "Alentah";
const SITE_TAGLINE = "Slow Journalism for Curious Minds";
const SITE_DESCRIPTION =
  "Slow journalism for curious minds. Independent editorial coverage of technology, business, culture, and more — one story at a time.";

// ============================================
// VIEWPORT
// ============================================

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#FAF7F2",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#1A1714",
    },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

// ============================================
// SEO METADATA — ALENTAH
// ============================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  generator: "Next.js",

  referrer: "origin-when-cross-origin",

  keywords: [
    "Alentah",
    "editorial publication",
    "slow journalism",
    "long-form journalism",
    "technology",
    "lifestyle",
    "finance",
    "culture",
    "travel",
    "health",
    "science",
    "design",
    "Talha Tabish",
  ],

  authors: [{ name: "Talha Tabish", url: SITE_URL }],
  creator: "Talha Tabish",
  publisher: SITE_NAME,

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
  },

  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/seo/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@alentah",
    creator: "@alentah",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/seo/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // verification: {
  //   google: "your-google-verification-token",
  // },

  other: {
    "msapplication-TileColor": "#6B4A2F",
    "msapplication-config": "/browserconfig.xml",
  },
};

// ============================================
// JSON-LD STRUCTURED DATA
// ============================================

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/seo/icon-512.png`,
  description: SITE_DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "Talha Tabish",
  },
  sameAs: [
    // "https://twitter.com/alentah",
    // "https://www.linkedin.com/company/alentah",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

// ============================================
// PREMIUM TYPOGRAPHY
// ============================================

const premiumTypography = {
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  textRendering: "optimizeLegibility",
  textSizeAdjust: "100%",

  fontFeatureSettings:
    '"ss01" on, "ss02" on, "cv01" on, "cv02" on, "cv03" on, "liga" on, "calt" on, "kern" on, "cpsp" on, "case" on, "salt" on',

  fontVariantLigatures: "common-ligatures contextual",
  fontVariantNumeric: "proportional-nums",
  fontKerning: "normal",
  fontOpticalSizing: "auto",
  fontSynthesis: "none",

  letterSpacing: "-0.008em",
  wordSpacing: "-0.008em",
  lineHeight: 1.6,
} as const;

// ============================================
// CLERK APPEARANCE — ALENTAH
// ============================================

const clerkAppearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--card)",
    colorForeground: "var(--card-foreground)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    colorMutedForeground: "var(--muted-foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorInputForeground: "var(--foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--primary)",
    colorWarning: "var(--secondary)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",

    borderRadius: "1rem",

    fontFamily: "var(--font-jakarta), ui-sans-serif, sans-serif",
    fontFamilyButtons: "var(--font-jakarta), ui-sans-serif, sans-serif",

    fontSize: "0.875rem",
    spacingUnit: "1rem",
  },

  elements: {
    rootBox: "font-sans",

    card: cn(
      "bg-card text-card-foreground",
      "border border-border",
      "rounded-3xl",
      "shadow-[0_40px_120px_-24px_rgba(0,0,0,0.35)]",
      "dark:shadow-[0_40px_120px_-24px_rgba(0,0,0,0.85)]",
      "overflow-hidden",
      "p-2",
    ),

    modalBackdrop: "bg-background/70 backdrop-blur-md",
    modalContent: "bg-card text-card-foreground rounded-3xl",

    modalCloseButton: cn(
      "text-muted-foreground hover:text-foreground",
      "hover:bg-accent rounded-full",
      "transition-colors",
    ),

    headerTitle: cn(
      "font-serif text-foreground text-2xl",
      "tracking-tight font-normal text-center",
    ),
    headerSubtitle: "text-muted-foreground text-sm text-center",

    logoBox: "hidden",
    logoImage: "hidden",

    socialButtonsBlockButton: cn(
      "border border-border bg-card text-foreground",
      "rounded-2xl h-12",
      "hover:bg-accent hover:border-primary/40",
      "transition-all duration-200",
      "shadow-none",
    ),
    socialButtonsBlockButtonText: cn(
      "text-foreground text-sm font-medium",
      "normal-case tracking-normal",
    ),
    socialButtonsProviderIcon: "w-5 h-5",

    dividerLine: "bg-border",
    dividerText:
      "text-muted-foreground text-[10px] uppercase tracking-[0.2em]",

    formFieldLabel:
      "text-foreground text-[11px] font-medium uppercase tracking-[0.15em]",

    formFieldInput: cn(
      "bg-background text-foreground placeholder:text-muted-foreground",
      "border border-border rounded-2xl h-12 px-4",
      "text-sm",
      "focus:ring-2 focus:ring-primary/40",
      "focus:border-primary/40",
      "transition-all duration-200",
    ),

    formFieldInputShowPasswordButton:
      "text-muted-foreground hover:text-foreground",
    formFieldErrorText: "text-destructive text-xs",
    formFieldSuccessText: "text-primary text-xs",
    formFieldHintText: "text-muted-foreground text-xs",

    formButtonPrimary: cn(
      "bg-primary text-primary-foreground",
      "rounded-2xl h-12",
      "text-[11px] font-semibold uppercase tracking-[0.18em]",
      "hover:bg-primary/90 hover:scale-[1.01]",
      "active:scale-[0.99]",
      "transition-all duration-200",
      "shadow-none normal-case",
    ),
    formButtonReset: "text-primary hover:text-primary/80 text-sm",

    footer: "bg-transparent",
    footerAction: "bg-transparent",
    footerActionText: "text-muted-foreground text-xs",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",

    identityPreview:
      "bg-accent border border-border rounded-2xl text-foreground",
    identityPreviewText: "text-foreground text-sm",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    identityPreviewEditButtonIcon: "text-primary",

    otpCodeFieldInput:
      "bg-background text-foreground border border-border rounded-xl text-lg font-serif",
    formResendCodeLink: "text-primary hover:text-primary/80",

    alternativeMethodsBlockButton: cn(
      "border border-border bg-card text-foreground",
      "rounded-2xl h-12",
      "hover:bg-accent hover:border-primary/40",
      "transition-all duration-200",
    ),
    alternativeMethodsBlockButtonText:
      "text-foreground text-sm font-medium",

    navbar: "bg-transparent",
    navbarButton: "text-foreground",
    navbarButtonIcon: "text-foreground",
    pageScrollBox: "bg-card",
    page: "bg-card",

    alert: "bg-accent border border-border rounded-2xl",
    alertText: "text-foreground text-sm",
    badge:
      "bg-primary/10 text-primary text-xs font-medium rounded-full px-2 py-0.5",
  },
} as const;

// ============================================
// ROOT LAYOUT
// ============================================

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable,
        "font-sans",
      )}
      suppressHydrationWarning
      style={premiumTypography}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col font-sans scrollbar-none overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider appearance={clerkAppearance}>
            <main className="flex flex-1 flex-col">{children}</main>

            {/* <ExitIntentPopup /> */}
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}