"use client";

import { useEffect, useState } from "react";

export type InsightToastPayload = {
  id: number;
  kind: "analysis" | "news";
  pair?: string;
  title: string;
  body: string;
};

type Props = {
  toast: InsightToastPayload | null;
  onDismiss: () => void;
};

const BG = "#2A2A2E";
const ACCENT = "#F3D382";
const STACK = "#252529";

/** Auto-dismiss after this many ms (user-dismiss or close still clears immediately). */
const TOAST_DURATION_MS = 20_000;

/**
 * Dark stacked toast — new analysis or news (reference: pill header, count chip, expandable body).
 */
export function InsightToast({ toast, onDismiss }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!toast) {
      setExpanded(false);
      return;
    }
    const t = window.setTimeout(() => onDismiss(), TOAST_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const badgeLabel =
    toast.kind === "news" ? "News" : "New analysis";

  return (
    <div
      key={toast.id}
      className="pointer-events-none fixed right-4 top-[4.5rem] z-[200] w-[min(calc(100vw-2rem),22rem)] animate-toast-enter"
      role="status"
      aria-live="polite"
      aria-relevant="additions text"
    >
      <div className="pointer-events-auto relative">
        {/* Stack layer behind (layered stack look) */}
        <div
          className="absolute inset-x-3 -top-2 h-9 rounded-t-[18px] opacity-[0.92]"
          style={{ backgroundColor: STACK }}
          aria-hidden
        />
        <div
          className="relative overflow-hidden rounded-[20px] border border-white/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
          style={{ backgroundColor: BG }}
        >
          <div className="relative flex items-center gap-3 px-4 pb-2 pt-3 pr-10">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums"
              style={{ backgroundColor: ACCENT, color: "#171717" }}
              aria-hidden
            >
              1
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/95">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENT }}
                aria-hidden
              />
              {badgeLabel}
            </span>
            {toast.pair ? (
              <span className="min-w-0 flex-1 truncate text-right text-[11px] font-medium uppercase tracking-wide text-white/45">
                {toast.pair}
              </span>
            ) : (
              <span className="min-w-0 flex-1" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="motion-press -mr-1 shrink-0 rounded-md p-1 text-white/70 transition-[color,transform] duration-150 ease-out hover:text-white"
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-3 top-3 rounded-md p-1 text-white/35 transition-colors hover:bg-white/[0.08] hover:text-white/85"
              aria-label="Dismiss notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="px-4 pb-4 pt-0">
            <p
              className={`text-[13px] leading-snug text-white/90 ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              <span className="font-medium text-white">{toast.title}</span>
              {toast.title ? " — " : ""}
              {toast.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
