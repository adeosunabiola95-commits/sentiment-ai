"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type InsightSheetPayload = {
  title: string;
  detail: string;
  headlines: string[];
  newsSource?: "newsapi" | "mock";
};

type Props = {
  open: boolean;
  onClose: () => void;
  payload: InsightSheetPayload | null;
};

function pickRelevantHeadlines(headlines: string[], context: string, limit = 6): string[] {
  const words = context
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  if (words.length === 0 || headlines.length === 0) {
    return headlines.slice(0, limit);
  }
  const scored = headlines.map((h) => ({
    h,
    score: words.reduce(
      (n, w) => (h.toLowerCase().includes(w) ? n + 1 : n),
      0
    ),
  }));
  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).map((s) => s.h);
  return (matched.length ? matched : headlines).slice(0, limit);
}

export function buildSheetPayload(
  title: string,
  detail: string,
  allHeadlines: string[],
  newsSource?: "newsapi" | "mock"
): InsightSheetPayload {
  return {
    title,
    detail,
    headlines: pickRelevantHeadlines(allHeadlines, detail),
    newsSource,
  };
}

export function InsightBottomSheet({ open, onClose, payload }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open || !payload || !mounted) return null;

  const sourceLabel =
    payload.newsSource === "newsapi"
      ? "Headlines from NewsAPI (live)"
      : "Sample headlines (add NEWSAPI_KEY on the server for live news)";

  /**
   * Matches DocsLayout: `div.lg:pl-5` then `main.mx-auto max-w-2xl px-4 sm:px-6 lg:px-8`
   * so drawer text lines up with the page column (fixed overlay is viewport-relative).
   */
  const layoutShell = "w-full lg:pl-5";
  const contentTrack =
    "mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8";

  return createPortal(
    <div
      className="fixed inset-0 z-[160] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insight-sheet-title"
    >
      {/* Bottom drawer: dimmed backdrop (fade-in) */}
      <button
        type="button"
        className="insight-drawer-backdrop absolute inset-0 z-0 bg-black/40 motion-reduce:transition-none"
        aria-label="Close"
        onClick={onClose}
      />
      {/* Bottom sheet: panel slides up from below */}
      <div
        className="insight-drawer-panel relative z-10 flex min-w-0 max-h-[min(85vh,100dvh)] w-full flex-col rounded-t-3xl border border-b-0 border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="shrink-0 border-b border-border pt-3 sm:pt-4">
          <div className={layoutShell}>
            <div className={contentTrack}>
              <div
                className="mb-3 flex justify-center sm:mb-0 sm:hidden"
                aria-hidden
              >
                <div className="h-1 w-10 shrink-0 rounded-full bg-border" />
              </div>
              <div className="flex w-full min-w-0 items-center justify-between gap-3 pb-2 sm:pb-3">
                <h2
                  id="insight-sheet-title"
                  className="min-w-0 text-base font-medium leading-snug text-text-primary"
                >
                  {payload.title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="motion-press shrink-0 rounded-lg p-2 text-text-tertiary hover:bg-elevated hover:text-text-primary"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className={layoutShell}>
            <div className={`${contentTrack} pb-6 pt-3`}>
              <p className="text-sm leading-relaxed text-text-secondary">{payload.detail}</p>
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  From the news feed
                </p>
                <p className="mt-1 text-[11px] leading-snug text-text-tertiary">{sourceLabel}</p>
                <ul className="mt-3 space-y-2">
                  {payload.headlines.length === 0 ? (
                    <li className="text-sm text-text-secondary">No headlines available for this run.</li>
                  ) : (
                    payload.headlines.map((line, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border-hairline bg-elevated/60 px-3 py-2.5 text-sm leading-snug text-text-primary"
                      >
                        {line}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
