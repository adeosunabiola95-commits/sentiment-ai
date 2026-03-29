"use client";

import type { Sentiment } from "@/lib/types";
import { sentimentFillHex } from "@/lib/sentimentColors";

/**
 * Liveline disables its canvas pill badge when `series` has multiple lines.
 * This mirrors Liveline’s badge look (left tail + dashed connector) for FX price.
 * Pill color follows **model bias** (bull / bear / neutral), not intraday % move.
 */
export function FxPriceBadge({
  pairLabel,
  rate,
  quote,
  changePct,
  sentiment,
  loading,
}: {
  pairLabel: string;
  rate: number;
  quote: string;
  changePct: number;
  sentiment: Sentiment;
  loading?: boolean;
}) {
  const decimals =
    quote === "JPY" || quote === "KRW" || quote === "VND" ? 3 : 5;
  const fill = sentimentFillHex(sentiment);
  const rateStr = rate.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const pctStr = `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="h-8 w-36 shrink-0 animate-pulse rounded-md bg-elevated" />
    );
  }

  return (
    <div className="flex w-full min-w-0 items-center gap-0">
      <div
        className="min-h-px min-w-0 flex-1 border-t border-dashed opacity-90"
        style={{ borderColor: "rgba(139, 92, 246, 0.45)" }}
        aria-hidden
      />
      <div className="relative z-10 flex shrink-0 items-stretch drop-shadow-[0_1px_4px_rgba(15,23,42,0.12)]">
        <div
          className="shrink-0 self-center"
          style={{
            width: 0,
            height: 0,
            marginRight: -1,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderRight: `8px solid ${fill}`,
          }}
          aria-hidden
        />
        <div
          className="flex flex-col justify-center rounded-r-md px-2.5 py-1 text-white"
          style={{ backgroundColor: fill }}
        >
          <p className="font-mono text-[11px] font-medium leading-tight tracking-tight [font-variant-numeric:tabular-nums]">
            {pairLabel}{" "}
            <span className="text-white/95">{rateStr}</span>
          </p>
          <p className="mt-0.5 font-mono text-[10px] font-medium leading-none text-white/90 [font-variant-numeric:tabular-nums]">
            {pctStr}{" "}
            <span className="font-normal text-white/75">24h</span>
          </p>
        </div>
      </div>
    </div>
  );
}
