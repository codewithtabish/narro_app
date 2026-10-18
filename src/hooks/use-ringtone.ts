// src/hooks/use-ringtone.ts
"use client";

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface UseRingtoneOptions {
  src: string;
  enabled: boolean;
  volume?: number;
  loop?: boolean;
  vibrate?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  useRingtone                                                                */
/* -------------------------------------------------------------------------- */
/**
 * Plays a looping ringtone while `enabled` is true.
 *
 * Guarantees the audio stops:
 *   • When `enabled` flips to false
 *   • When the component unmounts
 *   • When `src` changes
 *   • On any error (never crashes the app)
 */
export function useRingtone({
  src,
  enabled,
  volume = 0.5,
  loop = true,
  vibrate = false,
}: UseRingtoneOptions): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibrateTimerRef = useRef<number | null>(null);

  /* ── Main effect — start/stop based on `enabled` ──────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    /* ── STOP ─────────────────────────────────────────────── */
    if (!enabled) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          /* ignore */
        }
      }
      if (vibrateTimerRef.current !== null) {
        clearInterval(vibrateTimerRef.current);
        vibrateTimerRef.current = null;
      }
      if (vibrate && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          /* ignore */
        }
      }
      return;
    }

    /* ── START ────────────────────────────────────────────── */
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;
    audio.volume = volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("[useRingtone] Autoplay blocked:", err?.message);
      });
    }

    if (vibrate && "vibrate" in navigator) {
      const pattern = [400, 200, 400, 200];
      try {
        navigator.vibrate(pattern);
      } catch {
        /* ignore */
      }
      vibrateTimerRef.current = window.setInterval(() => {
        try {
          navigator.vibrate(pattern);
        } catch {
          /* ignore */
        }
      }, 1400);
    }

    return () => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
      if (vibrateTimerRef.current !== null) {
        clearInterval(vibrateTimerRef.current);
        vibrateTimerRef.current = null;
      }
      if (vibrate && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch {
          /* ignore */
        }
      }
    };
  }, [src, enabled, volume, loop, vibrate]);

  /* ── Hard stop on unmount ─────────────────────────────── */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = "";
        } catch {
          /* ignore */
        }
        audioRef.current = null;
      }
      if (vibrateTimerRef.current !== null) {
        clearInterval(vibrateTimerRef.current);
        vibrateTimerRef.current = null;
      }
    };
  }, []);
}