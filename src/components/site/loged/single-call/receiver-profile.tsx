// src/components/site/loged/single-call/receiver-profile.tsx
import {
  getReceiverUserAction,
  type ReceiverRecentCall,
} from "@/app/actions/user/get-receiver-user-action";
import { getInterestEmoji, getInterestLabel } from "@/data/interests";
import { getLanguageFlag, getLanguageName } from "@/data/languages";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Circle,
  MessageCircle,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CallButton } from "../../pages/community/calling/call-button";

/* -------------------------------------------------------------------------- */
/*  Constants + helpers                                                        */
/* -------------------------------------------------------------------------- */

const PROFICIENCY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  ELEMENTARY: "Elementary",
  INTERMEDIATE: "Intermediate",
  UPPER_INTERMEDIATE: "Upper intermediate",
  ADVANCED: "Advanced",
  NATIVE: "Native",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function memberSince(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/* -------------------------------------------------------------------------- */
/*  Recent-call helpers                                                        */
/* -------------------------------------------------------------------------- */

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function timeAgo(date: Date) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 1000),
  );

  if (seconds < 60) return "Just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, "day");

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return rtf.format(-weeks, "week");

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function callOutcome(call: ReceiverRecentCall) {
  switch (call.status) {
    case "ENDED":
      return { label: formatDuration(call.durationSeconds), answered: true };
    case "ACCEPTED":
      return { label: "In progress", answered: true };
    case "RINGING":
      return { label: "Ringing", answered: false };
    case "MISSED":
      return { label: "Missed", answered: false };
    case "REJECTED":
      return { label: "Declined", answered: false };
    case "CANCELLED":
      return { label: "Cancelled", answered: false };
  }
}

function RecentCallRow({ call }: { call: ReceiverRecentCall }) {
  const outcome = callOutcome(call);
  const isIncoming = call.direction === "INCOMING";
  const isMissed = call.status === "MISSED";

  const Icon = isMissed
    ? PhoneMissed
    : isIncoming
      ? PhoneIncoming
      : PhoneOutgoing;

  return (
    <li className="flex min-h-[48px] items-center justify-between gap-3 border-b border-border py-2 last:border-b-0">
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
            isMissed
              ? "border-destructive/40 text-destructive"
              : "border-border text-[#805039] dark:text-[#d9a584]"
          }`}
        >
          <Icon size={15} />
        </span>
        <span
          className={`truncate text-[13px] ${
            outcome.answered
              ? "text-foreground"
              : "italic text-muted-foreground"
          }`}
        >
          {isIncoming ? "Incoming call" : "Outgoing call"}
        </span>
      </span>

      <span className="shrink-0 text-xs text-muted-foreground">
        {outcome.label} · {timeAgo(call.createdAt)}
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </h2>
  );
}

function ProfileBanner() {
  return (
    <div
      aria-hidden="true"
      className="relative isolate h-[140px] overflow-hidden rounded-xl border border-border sm:h-[165px] lg:h-[180px] dark:brightness-90"
    >
      <div className="absolute inset-0 bg-[#f4e7d8]" />

      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(155,111,79,.24) .8px, transparent 1px)",
          backgroundSize: "12px 12px",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 900 230"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="receiverCopper" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#9A6445" />
            <stop offset="1" stopColor="#E4C5A7" />
          </linearGradient>
          <linearGradient id="receiverViolet" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#7774C7" />
            <stop offset="1" stopColor="#C5B7DC" />
          </linearGradient>
        </defs>

        <circle cx="450" cy="115" r="100" stroke="#BFA48C" strokeOpacity=".3" />
        <circle cx="450" cy="115" r="80" stroke="#BFA48C" strokeOpacity=".3" />
        <circle cx="450" cy="115" r="58" stroke="#BFA48C" strokeOpacity=".3" />
        <circle cx="450" cy="115" r="35" stroke="#BFA48C" strokeOpacity=".35" />

        <path
          d="M-35 69 C95 10 139 178 265 115 S390 110 450 115 C520 122 553 40 650 85 S800 160 935 64 L935 143 C820 220 733 112 650 135 S520 147 450 115 C380 83 326 195 235 144 S77 61 -35 151 Z"
          fill="url(#receiverCopper)"
          fillOpacity=".85"
        />

        <path
          d="M-30 122 C95 45 172 204 290 125 S393 107 450 115 C510 123 560 65 638 87 S806 188 930 104 L930 162 C816 220 735 137 645 145 S520 162 450 115 C385 76 327 210 225 158 S80 94 -30 181 Z"
          fill="#B68B70"
          fillOpacity=".55"
        />

        <path
          d="M250 82 C335 92 380 135 450 115 C523 94 563 48 630 72 S775 140 935 89 L935 126 C805 184 735 99 645 116 S525 149 450 115 C376 83 333 143 250 116 Z"
          fill="url(#receiverViolet)"
          fillOpacity=".88"
        />

        <path
          d="M-30 145 C75 88 143 187 245 143 S364 100 450 115 C542 132 582 167 677 126 S831 72 930 135"
          stroke="#FFF9F1"
          strokeWidth="2"
          strokeOpacity=".8"
        />

        <path
          d="M-30 95 C72 32 143 145 238 107 S372 83 450 115 C526 147 582 91 661 101 S827 170 930 75"
          stroke="#FFF9F1"
          strokeWidth="1.5"
          strokeOpacity=".7"
        />

        <path
          d="M450 94 V136"
          stroke="#FFF9F1"
          strokeWidth="1.5"
          strokeOpacity=".8"
        />
      </svg>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div
      className="w-full animate-pulse"
      role="status"
      aria-label="Loading profile"
    >
      <div className="h-[140px] rounded-xl bg-muted sm:h-[165px] lg:h-[180px]" />
      <div className="ml-4 mt-[-42px] h-24 w-24 rounded-full border-4 border-background bg-muted-foreground/20 sm:mt-[-54px] sm:h-28 sm:w-28" />
      <div className="mt-5 h-8 w-56 max-w-full rounded bg-muted" />
      <div className="mt-3 h-6 w-48 rounded-full bg-muted" />
      <div className="mt-8 space-y-3">
        <div className="h-11 rounded-lg bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
      </div>
      <div className="mt-8 h-24 rounded-lg bg-muted" />
      <span className="sr-only">Loading receiver profile…</span>
    </div>
  );
}

function ProfileError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#805039]/15 text-[#805039] dark:text-[#d9a584]">
          <Users size={23} />
        </div>

        <h2 className="mt-5 font-serif text-3xl text-foreground">
          Profile unavailable
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        <Link
          href="/app/calls"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#805039] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#69402d]"
        >
          <ArrowLeft size={16} />
          Back to calls
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main content                                                               */
/* -------------------------------------------------------------------------- */

export async function ReceiverProfileContent({
  receiverClerkUserId,
}: {
  receiverClerkUserId: string;
}) {
  const result = await getReceiverUserAction(receiverClerkUserId);

  if (!result.success) {
    return <ProfileError message={result.message} />;
  }

  const user = result.user;
  const firstName = user.name.split(" ")[0];
  const avatar = user.profileImageUrl ?? user.imageUrl;
  const speaking = user.languagesSpoken;
  const learning = user.languagesLearning;
  const proficiency = user.proficiencyByLanguage ?? {};

  return (
    <div className="w-full min-w-0">
      <Link
        href="/app/calls"
        className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to calls
      </Link>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,344px)]">
        {/* ───────────────────────── LEFT COLUMN ───────────────────────── */}
        <main className="min-w-0">
          <ProfileBanner />

          {/* Avatar + status dot */}
          <div className="relative ml-4 mt-[-46px] flex h-24 w-24 items-center justify-center overflow-visible rounded-full border-4 border-background shadow-sm sm:ml-5 sm:mt-[-60px] sm:h-32 sm:w-32">
            <div className="relative h-full w-full overflow-hidden rounded-full">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={`${user.name}'s profile picture`}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e9d9c9] font-serif text-3xl text-[#805039]">
                  {initials(user.name)}
                </div>
              )}
            </div>

            <span
              className={`absolute bottom-1 right-1 h-[17px] w-[17px] rounded-full border-[3px] border-background ${
                user.status === "ONLINE" ? "bg-[#29a45c]" : "bg-[#b8bdc8]"
              }`}
              title={user.status === "ONLINE" ? "Online" : "Offline"}
            />
          </div>

          {/* Name, languages, stats */}
          <div className="ml-1 mt-3 sm:ml-5">
            <h1 className="wrap-break-word font-serif text-[29px] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[36px]">
              {user.name}
            </h1>

            {speaking.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {speaking.map((code) => (
                  <li
                    key={code}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-foreground/80"
                  >
                    <span aria-hidden="true">{getLanguageFlag(code)}</span>
                    {getLanguageName(code)}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4 sm:gap-x-8">
              <div>
                <p className="font-serif text-[22px] font-semibold leading-none text-foreground">
                  {user.counts.totalCalls}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Total calls
                </p>
              </div>

              <span
                aria-hidden="true"
                className="hidden text-muted-foreground/50 sm:inline"
              >
                •
              </span>

              <div>
                <p className="flex items-center gap-1 font-serif text-[16px] font-semibold leading-none text-foreground sm:text-lg">
                  <CalendarDays size={16} className="text-[#a17b54]" />
                  {memberSince(user.createdAt)}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Member since
                </p>
              </div>
            </div>
          </div>

          {/* Learning */}
          <section className="mt-5 border-t border-border pt-3">
            <SectionLabel>Learning</SectionLabel>

            {learning.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {learning.map((code) => {
                  const level = proficiency[code] ?? "BEGINNER";

                  return (
                    <li
                      key={code}
                      className="flex min-h-[45px] items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 sm:px-4"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-foreground">
                        <span aria-hidden="true" className="text-[21px]">
                          {getLanguageFlag(code)}
                        </span>
                        <span className="truncate">{getLanguageName(code)}</span>
                      </span>

                      <span className="shrink-0 rounded-full bg-[#e9e7ff] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#6560db] sm:px-3 dark:bg-[#6560db]/25 dark:text-[#c9c6ff]">
                        {PROFICIENCY_LABELS[level] ?? level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No learning languages added yet.
              </p>
            )}
          </section>

          {/* About */}
          <section className="mt-4 border-t border-border pt-4">
            <SectionLabel>About</SectionLabel>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.8] text-foreground/80">
              {user.bio?.trim() ||
                `${user.name} hasn't added a bio yet. Start a conversation to get to know them.`}
            </p>
          </section>

          {/* Interests */}
          <section className="mt-4 border-t border-border pt-4">
            <SectionLabel>Interests</SectionLabel>

            {user.interests.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {user.interests.map((id) => (
                  <li
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs text-foreground/80"
                  >
                    <span aria-hidden="true">{getInterestEmoji(id)}</span>
                    {getInterestLabel(id)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No interests added yet.
              </p>
            )}
          </section>

          {/* Recent calls between the two users */}
          <section className="mt-4 border-t border-border pt-4">
            <SectionLabel>Recent calls with {firstName}</SectionLabel>

            {user.recentCalls.length > 0 ? (
              <ul className="mt-2">
                {user.recentCalls.map((call) => (
                  <RecentCallRow key={call.id} call={call} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                You haven&apos;t called each other yet. Use the Call button to
                start your first conversation.
              </p>
            )}
          </section>
        </main>

        {/* ───────────────────────── RIGHT COLUMN ───────────────────────── */}
        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-border p-4 sm:p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Start a conversation
            </h2>

            <div className="mt-5 space-y-3">
              <CallButton
                receiverId={user.id}
                receiverClerkId={user.clerkUserId}
                receiverName={user.name}
                // receiverAvatar={avatar}
              />

              <Link
                href={`/app/calls?receiverId=${encodeURIComponent(user.clerkUserId)}&action=message`}
                className="flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-border px-4 text-sm font-semibold text-[#805039] transition hover:bg-[#805039]/10 dark:text-[#d9a584]"
              >
                <MessageCircle size={21} />
                Send a message
              </Link>
            </div>

            <div className="my-6 border-t border-border" />

            <dl className="space-y-6">
              <div className="grid grid-cols-[85px_minmax(0,1fr)] gap-3 sm:grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Speaks
                </dt>
                <dd className="wrap-break-word text-[13px] text-foreground">
                  {speaking.length
                    ? speaking.map(getLanguageName).join(", ")
                    : "Not specified"}
                </dd>
              </div>

              <div className="grid grid-cols-[85px_minmax(0,1fr)] gap-3 sm:grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Learning
                </dt>
                <dd className="wrap-break-word text-[13px] text-foreground">
                  {learning.length
                    ? learning.map(getLanguageName).join(", ")
                    : "Not specified"}
                </dd>
              </div>

              <div className="grid grid-cols-[85px_minmax(0,1fr)] gap-3 sm:grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Availability
                </dt>
                <dd className="flex items-center gap-2 text-[13px] text-foreground">
                  <Circle
                    size={8}
                    fill={user.isAvailable ? "#29a45c" : "#b8bdc8"}
                    className="shrink-0 text-transparent"
                  />
                  {user.isAvailable ? "Available to talk" : "Not available"}
                </dd>
              </div>

              <div className="grid grid-cols-[85px_minmax(0,1fr)] gap-3 sm:grid-cols-[100px_minmax(0,1fr)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Member
                </dt>
                <dd className="text-[13px] text-foreground">
                  Since {memberSince(user.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="my-6 border-t border-border" />

            <p className="text-[11px] italic leading-5 text-muted-foreground">
              Language exchange is a great way to build confidence, one
              conversation at a time.
            </p>
          </div>

          <Link
            href="/app/calls"
            className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Explore other people
            </span>
            <ChevronRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}

export { ProfileSkeleton };

