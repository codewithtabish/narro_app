import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Static copyright year.
 *
 * IMPORTANT: Do NOT use `new Date().getFullYear()` here.
 * Next.js 16 with `cacheComponents: true` prerenders this route at build
 * time, and dynamic time values are not allowed during prerender.
 * Bump this manually each January 1st.
 */
const COPYRIGHT_YEAR = 2026;

/* -------------------------------------------------------------------------- */
/*  Social icons (inline SVG — brand logos aren't in lucide)                   */
/* -------------------------------------------------------------------------- */

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Link data                                                                  */
/* -------------------------------------------------------------------------- */

const PRODUCT_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Download", href: "/download" },
  { label: "How it works", href: "/how-it-works" },
] as const;

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Refund Policy", href: "/refund" },
] as const;

const SOCIAL_LINKS = [
  { label: "X (Twitter)", href: "https://x.com", Icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: LinkedInIcon },
  { label: "YouTube", href: "https://youtube.com", Icon: YouTubeIcon },
] as const;

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

export function Footer() {
  return (
    <footer
      data-slot="marketing-footer"
      className="relative w-full pt-16 sm:pt-20 lg:pt-24"
    >
      {/* ------------------------------------------------------------------ */}
      {/* MAIN GRID                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 xl:gap-12">
        {/* Brand column */}
        <div className="flex flex-col items-start sm:col-span-2 lg:col-span-5 xl:col-span-5">
          <Link
            href="/"
            aria-label="NARRO — Home"
            className="group inline-flex items-baseline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="font-serif text-2xl font-semibold uppercase tracking-[0.18em] text-primary transition-opacity duration-300 group-hover:opacity-80">
              Narro
            </span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
            Speak more. Fear less. Become fluent through real conversations
            with AI and real people.
          </p>

          {/* Social icons */}
          <ul className="mt-6 flex items-center gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Product */}
        <nav aria-labelledby="footer-product" className="lg:col-span-2 xl:col-span-2">
          <h3
            id="footer-product"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground"
          >
            Product
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Company */}
        <nav aria-labelledby="footer-company" className="lg:col-span-2 xl:col-span-2">
          <h3
            id="footer-company"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground"
          >
            Company
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal */}
        <nav aria-labelledby="footer-legal" className="lg:col-span-3 xl:col-span-3">
          <h3
            id="footer-legal"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground"
          >
            Legal
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BOTTOM BAR                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-14 flex flex-col items-start justify-between gap-6 pb-8 pt-8 sm:mt-16 sm:pb-10 sm:pt-10 lg:flex-row lg:items-center lg:gap-10">
        {/* Left — copyright + attribution */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground sm:text-[0.8rem]">
            © {COPYRIGHT_YEAR} NARRO. All rights reserved.
          </p>

          <p className="max-w-md text-xs leading-relaxed text-muted-foreground/90 sm:text-[0.8rem]">
            <span className="font-semibold text-foreground">
              CodeWithTabish
            </span>{" "}
            is a solo software developer and indie founder building innovative
            apps, websites, and digital products from idea to launch.{" "}
            <span className="italic">
              Independent by design, entrepreneurial by vision
            </span>{" "}
            — turning ideas into products that solve real-world problems.
          </p>
        </div>

        {/* Right — tagline */}
        <p className="text-xs text-muted-foreground sm:text-[0.8rem] lg:text-right">
          Made with <span aria-hidden="true">❤</span> for language learners.
        </p>
      </div>
    </footer>
  );
}