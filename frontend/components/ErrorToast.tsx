"use client";

import { useEffect } from "react";
import { IconButton } from "@/components/ui";
import { ds } from "@/lib/ds";

const ERROR_TOAST_MS = 10_000;

type Props = {
  message: string | null;
  onDismiss: () => void;
};

/**
 * Pale rose error surface (reference: soft border, maroon copy) — validation / API errors.
 */
export function ErrorToast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => onDismiss(), ERROR_TOAST_MS);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-[4.5rem] z-[205] w-[min(calc(100vw-2rem),22rem)] animate-toast-enter"
      role="alert"
      aria-live="assertive"
      aria-relevant="additions text"
    >
      <div className={ds.toast.error}>
        <p className="min-w-0">{message}</p>
        <IconButton
          type="button"
          variant="errorDismiss"
          label="Dismiss error"
          onClick={onDismiss}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
