"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Globe, Sparkles, TrendingUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { LANGUAGES, getLanguageFlag, getLanguageName } from "@/data/languages";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type AvailabilityFilter = "any" | "available";
export type LevelFilter = "any" | "beginner" | "intermediate" | "advanced";

interface CallsFiltersProps {
  activeTab: "partners" | "history";
  language: string | null;
  availability: AvailabilityFilter;
  level: LevelFilter;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Levels                                                                     */
/* -------------------------------------------------------------------------- */

const LEVELS: { id: LevelFilter; label: string; hint: string }[] = [
  { id: "any", label: "Any level", hint: "Show everyone" },
  { id: "beginner", label: "Beginner", hint: "A1 · A2" },
  { id: "intermediate", label: "Intermediate", hint: "B1 · B2" },
  { id: "advanced", label: "Advanced", hint: "C1 · C2 · Native" },
];

/* -------------------------------------------------------------------------- */
/*  CallsFilters                                                               */
/* -------------------------------------------------------------------------- */

export function CallsFilters({
  activeTab,
  language,
  availability,
  level,
}: CallsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });
  };

  if (activeTab !== "partners") return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none [&::-webkit-scrollbar]:hidden">
      {/* Language dropdown */}
      <LanguageDropdown
        selected={language}
        onSelect={(code) => updateParam("lang", code)}
      />

      {/* Availability dropdown */}
      <AvailabilityDropdown
        selected={availability}
        onSelect={(value) =>
          updateParam("available", value === "available" ? "1" : null)
        }
      />

      {/* Level dropdown */}
      <LevelDropdown
        selected={level}
        onSelect={(value) => updateParam("level", value === "any" ? null : value)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Language Dropdown                                                          */
/* -------------------------------------------------------------------------- */

function LanguageDropdown({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (code: string | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const label = selected ? getLanguageName(selected) : "Any language";
  const flag = selected ? getLanguageFlag(selected) : null;

  return (
    <div ref={ref} className="relative shrink-0">
      <ChipButton
        active={!!selected}
        onClick={() => setOpen((v) => !v)}
        icon={
          flag ? (
            <span className="text-sm leading-none">{flag}</span>
          ) : (
            <Globe className="h-3.5 w-3.5" strokeWidth={2.25} />
          )
        }
        label={label}
        isOpen={open}
      />

      <AnimatePresence>
        {open && (
          <DropdownPanel>
            <DropdownRow
              label="Any language"
              hint="Show everyone"
              active={!selected}
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
            />
            <div className="my-1 h-px bg-border/60" />
            <div className="max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {LANGUAGES.slice(0, 40).map((lang) => (
                <DropdownRow
                  key={lang.code}
                  icon={<span className="text-sm leading-none">{lang.flag}</span>}
                  label={lang.name}
                  hint={lang.nativeName}
                  active={selected === lang.code}
                  onClick={() => {
                    onSelect(lang.code);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </DropdownPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Availability Dropdown                                                      */
/* -------------------------------------------------------------------------- */

function AvailabilityDropdown({
  selected,
  onSelect,
}: {
  selected: AvailabilityFilter;
  onSelect: (value: AvailabilityFilter) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const label =
    selected === "available" ? "Available now" : "Anyone";

  return (
    <div ref={ref} className="relative shrink-0">
      <ChipButton
        active={selected === "available"}
        onClick={() => setOpen((v) => !v)}
        icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />}
        label={label}
        isOpen={open}
      />

      <AnimatePresence>
        {open && (
          <DropdownPanel>
            <DropdownRow
              label="Anyone"
              hint="Show all users"
              active={selected === "any"}
              onClick={() => {
                onSelect("any");
                setOpen(false);
              }}
            />
            <DropdownRow
              label="Available now"
              hint="Only users accepting calls"
              active={selected === "available"}
              onClick={() => {
                onSelect("available");
                setOpen(false);
              }}
            />
          </DropdownPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Level Dropdown                                                             */
/* -------------------------------------------------------------------------- */

function LevelDropdown({
  selected,
  onSelect,
}: {
  selected: LevelFilter;
  onSelect: (value: LevelFilter) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const current = LEVELS.find((l) => l.id === selected) ?? LEVELS[0];

  return (
    <div ref={ref} className="relative shrink-0">
      <ChipButton
        active={selected !== "any"}
        onClick={() => setOpen((v) => !v)}
        icon={<TrendingUp className="h-3.5 w-3.5" strokeWidth={2.25} />}
        label={current.label}
        isOpen={open}
      />

      <AnimatePresence>
        {open && (
          <DropdownPanel>
            {LEVELS.map((lvl) => (
              <DropdownRow
                key={lvl.id}
                label={lvl.label}
                hint={lvl.hint}
                active={selected === lvl.id}
                onClick={() => {
                  onSelect(lvl.id);
                  setOpen(false);
                }}
              />
            ))}
          </DropdownPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared building blocks                                                     */
/* -------------------------------------------------------------------------- */

interface ChipButtonProps {
  icon?: React.ReactNode;
  label: string;
  active?: boolean;
  isOpen?: boolean;
  onClick: () => void;
}

function ChipButton({
  icon,
  label,
  active = false,
  isOpen = false,
  onClick,
}: ChipButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full px-3.5",
        "text-[13px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active || isOpen
          ? "border border-primary bg-primary/10 text-primary"
          : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5",
      )}
    >
      {icon && (
        <span aria-hidden="true" className="text-current">
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
      <ChevronDown
        className={cn(
          "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </button>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      className={cn(
        "absolute right-0 top-full z-40 mt-2 w-[240px]",
        "overflow-hidden rounded-2xl",
        "border border-border bg-popover p-1.5",
        "shadow-[0_20px_40px_-12px_rgba(20,15,12,0.35)]",
      )}
    >
      {children}
    </motion.div>
  );
}

interface DropdownRowProps {
  icon?: React.ReactNode;
  label: string;
  hint?: string;
  active?: boolean;
  onClick: () => void;
}

function DropdownRow({
  icon,
  label,
  hint,
  active = false,
  onClick,
}: DropdownRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5",
        "text-left transition-colors duration-150",
        active ? "bg-primary/8" : "hover:bg-secondary/60",
        "focus-visible:outline-none focus-visible:bg-secondary/60",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon && <span aria-hidden="true">{icon}</span>}
        <span className="flex min-w-0 flex-col">
          <span
            className={cn(
              "truncate text-sm font-medium",
              active ? "text-primary" : "text-foreground",
            )}
          >
            {label}
          </span>
          {hint && (
            <span className="truncate text-[11px] text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
      </span>

      {active && (
        <Check
          className="h-3.5 w-3.5 shrink-0 text-primary"
          strokeWidth={3}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Outside click hook                                                         */
/* -------------------------------------------------------------------------- */

function useOutsideClick(
  ref: React.RefObject<HTMLDivElement | null>,
  onOutside: () => void,
) {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}