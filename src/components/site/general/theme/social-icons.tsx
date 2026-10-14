// src/components/icons/social-icons.tsx
// ============================================================
// Icons — ALENTAH
// Hand-rolled SVG icons (lucide dropped brand icons).
// Editorial thin-stroke style, all use `currentColor`.
// ============================================================

type IconProps = {
  className?: string;
};

// ============================================================
// SOCIAL BRANDS
// ============================================================

export function XIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.53 2.5h3.2l-7 8 8.24 11h-6.45l-5.05-6.63L4.6 21.5H1.4l7.49-8.56L1 2.5h6.61l4.56 6.06 5.36-6.06Zm-1.12 17.02h1.77L7.66 4.38H5.76l10.65 15.14Z" />
    </svg>
  );
}

export function TwitterIcon({ className }: IconProps) {
  return <XIcon className={className} />;
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H9.4v2.8h2.4V21" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="7.5" y1="10.2" x2="7.5" y2="17" />
      <circle cx="7.5" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11.5 17v-4.3c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5V17" />
      <line x1="11.5" y1="10.2" x2="11.5" y2="17" />
    </svg>
  );
}

export function GithubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.5 2 2 6.6 2 12.1c0 4.4 2.9 8.1 6.8 9.4.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.2-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.2-.5-1.3.1-2.7 0 0 .8-.3 2.7 1 .8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.5.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.7-4.6 4.9.3.3.6.8.6 1.7v2.5c0 .3.2.6.7.5 3.9-1.3 6.8-5 6.8-9.4C22 6.6 17.5 2 12 2Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.5 3h-2.8v12.4a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.05.77.13V9.98a5.53 5.53 0 0 0-.77-.06 5.5 5.5 0 1 0 5.5 5.5V8.83a6.9 6.9 0 0 0 4 1.28V7.2a4.2 4.2 0 0 1-4.1-4.2Z" />
    </svg>
  );
}

export function ThreadsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8.5 11.5c0-2.2 1.7-3.5 3.6-3.5 2.7 0 3.7 1.8 3.7 4.2 0 1.6-.8 2.3-1.8 2.3-.9 0-1.4-.6-1.4-1.4 0-1 .8-1.6 2-1.6.9 0 1.4.3 1.9.6" />
    </svg>
  );
}

export function PinterestIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M10.2 20c-.3-1-.4-2-.2-3.2l1-4.2M12.5 8c1.6 0 2.7 1.1 2.7 2.6 0 1.9-1 3.4-2.4 3.4-.8 0-1.4-.7-1.2-1.5l.5-2c.1-.5-.2-.9-.7-.9-.7 0-1.4.8-1.4 2 0 .4.1.7.1.7" />
    </svg>
  );
}

export function RedditIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="14" rx="8.5" ry="5.5" />
      <circle cx="17" cy="6" r="1.6" />
      <path d="M17 7.5 12.5 12" />
      <circle cx="9" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9.5 16c.9.7 1.8 1 2.5 1s1.6-.3 2.5-1" />
    </svg>
  );
}

export function WhatsappIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l1.8-5.4A8.5 8.5 0 1 1 8.4 19L3 21Z" />
      <path d="M8.5 10.5c.3 1.3 1.5 2.7 3 3.5 1 .5 1.6.6 2.1.6.4 0 .8-.4 1-.9l.2-.5c.1-.3 0-.5-.2-.6l-1.1-.6c-.2-.1-.4-.1-.5.1l-.5.6c-.1.1-.3.2-.5.1-.6-.3-1.5-1-1.9-1.7-.1-.2 0-.4.1-.5l.4-.5c.2-.2.2-.4.1-.6l-.5-1.1c-.1-.2-.4-.3-.6-.2l-.4.2c-.5.3-.7.9-.4 1.7Z" />
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 4 3 11.5l5 2 1.5 5.5L13 15l5.5 4L21 4Z" />
      <path d="M8 13.5 21 4" />
    </svg>
  );
}

export function DribbbleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M5 8c4 2 8 3 13 2M3.5 14c5-1 10-3 12-8M9 3c3 3 5 8 5 13.5" />
    </svg>
  );
}

export function BehanceIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 7h5c1.7 0 3 1.3 3 3s-1.3 3-3 3H3V7Zm0 6h5.5c1.9 0 3.5 1.5 3.5 3.4 0 1.4-1 2.6-2.5 2.6H3v-6Z" />
      <path d="M14 7h6M14 14c0-2 1.5-3.5 3.5-3.5 2 0 3.4 1.4 3.4 3.5 0 .3 0 .5-.1.7H14c0 1.5 1.2 2.5 2.5 2.5.9 0 1.6-.3 2.1-.9" />
    </svg>
  );
}

export function MediumIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="6.5" cy="12" rx="5.2" ry="5.5" />
      <ellipse cx="15.5" cy="12" rx="2.4" ry="5" />
      <ellipse cx="21" cy="12" rx="1.3" ry="4.6" />
    </svg>
  );
}

export function SubstackIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5h16v3H4zM4 11h16v3H4zM4 17h16l-8 4-8-4Z" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.5 2.7 4 6 4 9.5s-1.5 6.8-4 9.5c-2.5-2.7-4-6-4-9.5s1.5-6.8 4-9.5Z" />
    </svg>
  );
}

export function RssIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ============================================================
// ADMIN / EDITORIAL
// ============================================================

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 4 5v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V5l-8-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function PenIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

export function QuillIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 4c-6 0-11 3-14 10l-2 6 6-2c7-3 10-8 10-14Z" />
      <path d="M20 4 8 16" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="m15.5 8.5-2 5.5-5.5 2 2-5.5 5.5-2Z" />
    </svg>
  );
}

export function BookmarkFillIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function BookmarkOutlineIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.5S3 14 3 8.5a4.5 4.5 0 0 1 9-1.5 4.5 4.5 0 0 1 9 1.5c0 5.5-9 12-9 12Z" />
    </svg>
  );
}

export function HeartFillIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20.5S3 14 3 8.5a4.5 4.5 0 0 1 9-1.5 4.5 4.5 0 0 1 9 1.5c0 5.5-9 12-9 12Z" />
    </svg>
  );
}

export function BookOpenIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H3V4Z" />
      <path d="M21 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7V4Z" />
    </svg>
  );
}

export function NewspaperIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 5h14a1 1 0 0 1 1 1v13H4a1 1 0 0 1-1-1V5Z" />
      <path d="M18 8h3v10a2 2 0 0 1-2 2" />
      <path d="M6 8h7M6 12h7M6 16h4" />
    </svg>
  );
}

export function ScrollIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h10a2 2 0 0 1 2 2v14a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V3Z" />
      <path d="M10 8h5M10 12h5M10 16h3" />
    </svg>
  );
}

export function UserCircleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 19c1-2.5 3-4 5.5-4s4.5 1.5 5.5 4" />
    </svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z" />
    </svg>
  );
}

export function FolderOpenIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v2H3V6Z" />
      <path d="M3 10h19l-2 10H4L3 10Z" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 3h8l10 10-8 8L3 11V3Z" />
      <circle cx="8" cy="8" r="1.3" />
    </svg>
  );
}

export function BellOutlineIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5H4.5L6 16Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.5-4.5" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
    </svg>
  );
}

export function SparkFillIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 14 10l8 2-8 2-2 8-2-8-8-2 8-2 2-8Z" />
    </svg>
  );
}

// ============================================================
// BATCH EXPORT (for programmatic use)
// ============================================================

export const SOCIAL_ICONS = {
  x: XIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  threads: ThreadsIcon,
  pinterest: PinterestIcon,
  reddit: RedditIcon,
  whatsapp: WhatsappIcon,
  telegram: TelegramIcon,
  dribbble: DribbbleIcon,
  behance: BehanceIcon,
  medium: MediumIcon,
  substack: SubstackIcon,
  globe: GlobeIcon,
  rss: RssIcon,
} as const;

export type SocialIconKey = keyof typeof SOCIAL_ICONS;