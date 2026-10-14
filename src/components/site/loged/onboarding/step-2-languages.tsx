"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import * as React from "react";

import {
    filterLanguages,
    type Language,
    LANGUAGES,
    POPULAR_LANGUAGES,
} from "@/data/languages";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "./onboarding-modal";

/* -------------------------------------------------------------------------- */
/*  Step 2 — Languages (dropdown multi-select)                                 */
/* -------------------------------------------------------------------------- */

interface Step2LanguagesProps {
  data: OnboardingData;
  updateData: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Step2Languages({
  data,
  updateData,
  onNext,
  onBack,
}: Step2LanguagesProps) {
  const reduceMotion = useReducedMotion();

  const canContinue =
    data.languagesSpoken.length >= 1 && data.languagesLearning.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }}
        className="text-center"
      >
        <h2
          id="onboarding-modal-title"
          className="font-serif text-[1.6rem] font-normal leading-tight tracking-[-0.02em] text-foreground sm:text-[1.85rem]"
        >
          What languages do you know?
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Select all that apply. This helps us match you with the right
          partners.
        </p>
      </motion.div>

      <div className="mt-8 space-y-6">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.15 }}
        >
          <LanguageDropdown
            label="I speak"
            helperText="Select every language you're comfortable in"
            selected={data.languagesSpoken}
            onChange={(codes) => updateData({ languagesSpoken: codes })}
            placeholder="Select languages you speak"
          />
        </motion.div>

        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.25 }}
        >
          <LanguageDropdown
            label="I'm learning"
            helperText="Select every language you want to practice"
            selected={data.languagesLearning}
            onChange={(codes) => updateData({ languagesLearning: codes })}
            placeholder="Select languages you're learning"
          />
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.35 }}
        className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"
      >
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-full",
            "border border-border bg-transparent px-6",
            "text-sm font-semibold text-foreground",
            "transition-all duration-200",
            "hover:border-primary/40 hover:bg-primary/5",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          ← Back
        </button>

        <button
          type="submit"
          disabled={!canContinue}
          className={cn(
            "group inline-flex h-11 items-center justify-center gap-2 rounded-full",
            "bg-primary px-8 text-sm font-semibold text-primary-foreground",
            "shadow-[0_8px_20px_-6px_var(--color-primary)]",
            "transition-all duration-200",
            "hover:bg-primary/90 hover:shadow-[0_12px_28px_-8px_var(--color-primary)]",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          )}
        >
          Continue
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </motion.div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  LanguageDropdown                                                           */
/* -------------------------------------------------------------------------- */

interface LanguageDropdownProps {
  label: string;
  helperText: string;
  selected: string[];
  onChange: (codes: string[]) => void;
  placeholder: string;
}

function LanguageDropdown({
  label,
  helperText,
  selected,
  onChange,
  placeholder,
}: LanguageDropdownProps) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  /* -------- Close on outside click -------- */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* -------- Close on Escape -------- */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  /* -------- Autofocus search when dropdown opens -------- */
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  /* -------- Toggle open + reset query when opening -------- */
  const handleToggleOpen = () => {
    if (!open) setQuery("");
    setOpen((v) => !v);
  };

  /* -------- Keyboard handler for trigger (role="button") -------- */
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleOpen();
    }
  };

  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  const removeChip = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((c) => c !== code));
  };

  /* -------- Keyboard handler for rows (role="option") -------- */
  const handleRowKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    code: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(code);
    }
  };

  const listToShow: Language[] = React.useMemo(() => {
    if (query.trim().length > 0) return filterLanguages(query).slice(0, 40);
    const popular = POPULAR_LANGUAGES;
    const selectedLangs = selected
      .map((c) => LANGUAGES.find((l) => l.code === c))
      .filter((l): l is Language => !!l && !popular.some((p) => p.code === l.code));
    return [...popular, ...selectedLangs];
  }, [query, selected]);

  const selectedLanguages = selected
    .map((code) => LANGUAGES.find((l) => l.code === code))
    .filter((l): l is Language => !!l);

  return (
    <div ref={containerRef} className="relative">
      {/* ─────────── Label ─────────── */}
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="flex flex-col">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </label>
          <span className="mt-0.5 text-[11px] text-muted-foreground/80">
            {helperText}
          </span>
        </div>

        {selected.length > 0 && (
          <motion.span
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "shrink-0 rounded-full bg-primary/10 px-2.5 py-1",
              "text-[10px] font-bold uppercase tracking-[0.08em] text-primary",
              "tabular-nums",
            )}
          >
            {selected.length} selected
          </motion.span>
        )}
      </div>

      {/* ─────────── Trigger (DIV, not BUTTON) ─────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleToggleOpen}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between gap-3",
          "min-h-[52px] rounded-2xl border border-border bg-background px-4 py-2.5",
          "text-left transition-all duration-200",
          "hover:border-border/80",
          open && "border-primary ring-4 ring-primary/15",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {selectedLanguages.length === 0 ? (
            <span className="text-sm text-muted-foreground/70">
              {placeholder}
            </span>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {selectedLanguages.map((lang) => (
                <motion.span
                  key={lang.code}
                  layout
                  initial={
                    reduceMotion ? undefined : { opacity: 0, scale: 0.8 }
                  }
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full",
                    "bg-primary/10 px-2.5 py-1",
                    "text-[11px] font-medium text-primary",
                  )}
                >
                  <span aria-hidden="true" className="text-xs leading-none">
                    {lang.flag}
                  </span>
                  <span className="max-w-[120px] truncate">{lang.name}</span>
                  {/* Chip remove — <span role="button"> to avoid nesting */}
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label={`Remove ${lang.name}`}
                    onClick={(e) => removeChip(lang.code, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange(selected.filter((c) => c !== lang.code));
                      }
                    }}
                    className={cn(
                      "inline-flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full",
                      "transition-colors duration-150",
                      "hover:bg-primary/20",
                    )}
                  >
                    <X className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </div>

      {/* ─────────── Dropdown panel ─────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={
              reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className={cn(
              "absolute left-0 right-0 top-full z-30 mt-2",
              "overflow-hidden rounded-2xl",
              "border border-border bg-popover shadow-[0_20px_40px_-12px_rgba(20,15,12,0.35)]",
            )}
          >
            {/* Search inside dropdown */}
            <div className="relative border-b border-border/60 p-2.5">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search languages..."
                className={cn(
                  "h-10 w-full rounded-xl bg-secondary/50 pl-10 pr-4",
                  "text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/70",
                  "transition-colors duration-200",
                  "focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/25",
                )}
              />
            </div>

            {/* Language list */}
            <ul
              role="listbox"
              className={cn(
                "max-h-[280px] overflow-y-auto p-1.5",
                "scrollbar-thin",
                "[scrollbar-color:var(--color-border)_transparent]",
                "[&::-webkit-scrollbar]:w-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:bg-border/60",
                "[&::-webkit-scrollbar-thumb:hover]:bg-border",
              )}
            >
              {listToShow.length === 0 ? (
                <li className="p-6 text-center">
                  <p className="text-sm font-medium text-foreground">
                    No matches found
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try a different search term
                  </p>
                </li>
              ) : (
                listToShow.map((lang) => {
                  const isSelected = selected.includes(lang.code);
                  return (
                    <li key={lang.code} role="option" aria-selected={isSelected}>
                      {/* Row — DIV with role="option" (avoids nested buttons) */}
                      <div
                        role="option"
                        tabIndex={0}
                        onClick={() => toggle(lang.code)}
                        onKeyDown={(e) => handleRowKeyDown(e, lang.code)}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5",
                          "text-left transition-colors duration-150",
                          isSelected
                            ? "bg-primary/8"
                            : "hover:bg-secondary/60",
                          "focus-visible:outline-none focus-visible:bg-secondary/60",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-lg leading-none"
                          >
                            {lang.flag}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span
                              className={cn(
                                "truncate text-sm font-medium",
                                isSelected
                                  ? "text-primary"
                                  : "text-foreground",
                              )}
                            >
                              {lang.name}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                              {lang.nativeName}
                            </span>
                          </span>
                        </span>

                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            "transition-all duration-200",
                            isSelected
                              ? "bg-primary"
                              : "border border-border bg-transparent",
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <Check
                              className="h-3 w-3 text-primary-foreground"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {listToShow.length} languages
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-full bg-primary px-3.5 py-1.5",
                  "text-[11px] font-semibold text-primary-foreground",
                  "transition-colors duration-150 hover:bg-primary/90",
                )}
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}