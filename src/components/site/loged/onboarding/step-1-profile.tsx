"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { uploadAvatarAction } from "@/app/actions/images/upload-avatar-action";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "./onboarding-modal";

/* -------------------------------------------------------------------------- */
/*  Step 1 — Profile (name + avatar)                                           */
/* -------------------------------------------------------------------------- */

interface Step1ProfileProps {
  data: OnboardingData;
  updateData: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Step1Profile({ data, updateData, onNext }: Step1ProfileProps) {
  const reduceMotion = useReducedMotion();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadAvatarAction(formData);

    if (result.success) {
      updateData({ profileImageUrl: result.data.url });
    } else {
      setError(result.error);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canContinue = data.name.trim().length >= 2;
  const hasAvatar = Boolean(data.profileImageUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinue) return;
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center text-center"
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADING                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.05 }}
        className="flex flex-col items-center"
      >
        {/* Sparkle badge */}
        <span
          aria-hidden="true"
          className={cn(
            "mb-3 inline-flex h-10 w-10 items-center justify-center",
            "rounded-full bg-primary/10 text-primary",
            "ring-1 ring-primary/20",
          )}
        >
          <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
        </span>

        <h2
          id="onboarding-modal-title"
          className="font-serif text-[1.55rem] font-normal leading-tight tracking-[-0.02em] text-foreground sm:text-[1.8rem]"
        >
          Welcome to NARRO
        </h2>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Let&apos;s set up your profile — it takes 20 seconds.
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* AVATAR UPLOAD                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 }}
        className="mt-6 flex flex-col items-center"
      >
        <div className="relative">
          {/* Soft radial glow behind the avatar when set */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -inset-5 rounded-full",
              "bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_70%)]",
              "opacity-0 transition-opacity duration-500",
              hasAvatar && "opacity-[0.10]",
            )}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label={hasAvatar ? "Change profile photo" : "Upload profile photo"}
            className={cn(
              "group relative block h-[100px] w-[100px] overflow-hidden rounded-full",
              "bg-secondary",
              "ring-1 ring-border",
              "transition-all duration-300",
              "hover:ring-2 hover:ring-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-card",
              "disabled:cursor-not-allowed",
            )}
          >
            {/* Image or placeholder */}
            {hasAvatar ? (
              <Image
                src={data.profileImageUrl!}
                alt="Profile photo"
                fill
                sizes="100px"
                priority
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {uploading ? (
                  <Loader2
                    className="h-6 w-6 animate-spin text-primary"
                    strokeWidth={2}
                  />
                ) : (
                  <Camera
                    className="h-6 w-6 text-primary/70"
                    strokeWidth={1.75}
                  />
                )}
              </span>
            )}

            {/* Hover overlay — for uploaded avatars */}
            {hasAvatar && !uploading && (
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "bg-foreground/50 backdrop-blur-[2px]",
                  "opacity-0 transition-opacity duration-200",
                  "group-hover:opacity-100",
                )}
              >
                <Camera className="h-5 w-5 text-white" strokeWidth={2.25} />
              </span>
            )}

            {/* Uploading overlay */}
            {uploading && hasAvatar && (
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
                <Loader2
                  className="h-5 w-5 animate-spin text-white"
                  strokeWidth={2.5}
                />
              </span>
            )}

            {/* Success ring */}
            <AnimatePresence>
              {hasAvatar && !uploading && (
                <motion.span
                  key="success-ring"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/30"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </button>

          {/* Success badge */}
          <AnimatePresence>
            {hasAvatar && !uploading && (
              <motion.span
                key="success-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.1 }}
                aria-hidden="true"
                className={cn(
                  "absolute bottom-0 right-0 z-10",
                  "flex h-6 w-6 items-center justify-center",
                  "rounded-full bg-primary",
                  "ring-[3px] ring-card",
                )}
              >
                <Check
                  className="h-3 w-3 text-primary-foreground"
                  strokeWidth={3}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/tiff"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {hasAvatar ? "Tap to change your photo" : "Tap to upload (optional)"}
        </p>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              role="alert"
              className="mt-2.5 max-w-xs rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-medium text-destructive"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* NAME FIELD                                                   */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.25 }}
        className="mt-6 w-full max-w-sm text-left"
      >
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label
            htmlFor="onboarding-name"
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Display name
          </label>

          <AnimatePresence>
            {data.name.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "text-[10px] font-medium tabular-nums",
                  data.name.length >= 50
                    ? "text-destructive"
                    : "text-muted-foreground/60",
                )}
              >
                {data.name.length}/50
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <input
          id="onboarding-name"
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Your name"
          autoComplete="name"
          autoFocus
          maxLength={50}
          className={cn(
            "h-12 w-full rounded-2xl border border-border bg-background px-4",
            "text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground/70",
            "transition-all duration-200",
            "hover:border-border/80",
            "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
          )}
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CONTINUE                                                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <motion.button
        type="submit"
        disabled={!canContinue || uploading}
        initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.35 }}
        className={cn(
          "group mt-6 inline-flex h-11 w-full max-w-sm items-center justify-center gap-2 rounded-full",
          "bg-primary text-primary-foreground",
          "text-sm font-semibold",
          "shadow-[0_8px_20px_-6px_var(--color-primary)]",
          "transition-all duration-200",
          "hover:bg-primary/90 hover:shadow-[0_12px_28px_-8px_var(--color-primary)]",
          "active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            Uploading…
          </>
        ) : (
          <>
            Continue
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </>
        )}
      </motion.button>
    </form>
  );
}