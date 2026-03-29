"use client";

import { useEffect, useState } from "react";

/**
 * Retail FX is commonly treated as closed Fri ~22:00 UTC → Sun ~22:00 UTC.
 */
export function isFxSpotMarketOpen(date: Date): boolean {
  const day = date.getUTCDay();
  const hour = date.getUTCHours();
  if (day === 6) return false;
  if (day === 0 && hour < 22) return false;
  if (day === 5 && hour >= 22) return false;
  return true;
}

export function MarketStatusBadge() {
  const [open, setOpen] = useState(() => isFxSpotMarketOpen(new Date()));

  useEffect(() => {
    const tick = () => setOpen(isFxSpotMarketOpen(new Date()));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-2.5 py-1 font-sans text-xs font-normal text-text-secondary"
      role="status"
      aria-live="polite"
    >
      {open ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 transition-colors duration-200 ease-out"
          aria-hidden
        />
      ) : (
        <span className="relative inline-flex h-2 w-2 shrink-0" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75 motion-reduce:animate-none motion-reduce:opacity-0" />
          <span className="relative h-2 w-2 rounded-full bg-red-500" />
        </span>
      )}
      <span>{open ? "Market open" : "Market closed"}</span>
    </span>
  );
}
