"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useWebHaptics } from "web-haptics/react";

type HapticsApi = ReturnType<typeof useWebHaptics>;

const HapticsContext = createContext<HapticsApi | null>(null);

function readHapticsSoundFlag(): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env.NEXT_PUBLIC_HAPTICS_SOUND?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

/**
 * Browsers gate Web Audio until a user gesture. Success haptics fire *after* the
 * analyze request finishes, so there is no gesture — audio stays silent unless we
 * unlock the tab on first tap/keypress.
 */
function usePrimeWebAudio(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let done = false;
    const prime = () => {
      if (done) return;
      done = true;
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("keydown", prime, true);

      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;

      try {
        const ctx = new AC();
        void ctx.resume().finally(() => {
          try {
            ctx.close();
          } catch {
            /* ignore */
          }
        });
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("pointerdown", prime, true);
    window.addEventListener("keydown", prime, true);
    return () => {
      window.removeEventListener("pointerdown", prime, true);
      window.removeEventListener("keydown", prime, true);
    };
  }, [enabled]);
}

/**
 * When `NEXT_PUBLIC_HAPTICS_SOUND` is `1`, `true`, `yes`, or `on`, enables
 * web-haptics **debug** mode (soft click sounds on desktop). Restart `next dev`
 * after changing env. Click or press a key once on the page so the browser
 * unlocks audio before the async “pair loaded” haptic runs.
 */
export function HapticsProvider({ children }: { children: ReactNode }) {
  const soundEnabled = useMemo(() => readHapticsSoundFlag(), []);
  usePrimeWebAudio(soundEnabled);

  const haptics = useWebHaptics({
    debug: soundEnabled,
    showSwitch: false,
  });

  return (
    <HapticsContext.Provider value={haptics}>
      {children}
    </HapticsContext.Provider>
  );
}

export function useAppHaptics(): HapticsApi {
  const ctx = useContext(HapticsContext);
  if (!ctx) {
    throw new Error("useAppHaptics must be used within HapticsProvider");
  }
  return ctx;
}
