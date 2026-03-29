"use client";

import { Liveline } from "liveline";
import type { LivelinePoint } from "liveline";
import { useMemo, useState } from "react";
import type { HistoryEntry, Sentiment } from "@/lib/types";

const COLOR = "#6366f1";

function sentimentToValue(s: Sentiment): number {
  switch (s) {
    case "Bearish":
      return 32;
    case "Bullish":
      return 68;
    default:
      return 50;
  }
}

function buildPoints(entries: HistoryEntry[]): LivelinePoint[] {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
  return sorted.map((e) => ({
    time: Math.floor(new Date(e.at).getTime() / 1000),
    value: sentimentToValue(e.sentiment),
  }));
}

/**
 * Liveline strip for “recent analyses” — uses the same advanced props as the main chart
 * where it makes sense (grid, scrub, reference line).
 */
function RecentHistoryChart({
  pair,
  history,
}: {
  pair: string;
  history: HistoryEntry[];
}) {
  const [hoverNote, setHoverNote] = useState<string | null>(null);

  const forPair = useMemo(
    () => history.filter((h) => h.pair === pair),
    [history, pair]
  );

  const { data, value, windowSecs } = useMemo(() => {
    const pts = buildPoints(forPair);
    if (pts.length === 0) {
      return { data: [] as LivelinePoint[], value: 50, windowSecs: 86_400 };
    }
    const last = pts[pts.length - 1];
    const first = pts[0];
    const span = last.time - first.time;
    const window = Math.max(3_600, Math.min(86_400 * 14, span > 0 ? span : 86_400));
    return { data: pts, value: last.value, windowSecs: window };
  }, [forPair]);

  if (forPair.length === 0) {
    return (
      <p className="mb-20 text-xs text-text-tertiary">
        {pair.length === 6
          ? `No analyses for ${pair} in history yet — run an analysis to see the strip fill in.`
          : "No analyses in history yet — choose a pair and run an analysis to see the strip fill in."}
      </p>
    );
  }

  return (
    <div className="mb-20">
      <p className="mb-2 text-xs font-medium text-text-secondary">
        Sentiment history — {pair}
      </p>
      {hoverNote && (
        <p className="mb-2 text-xs text-text-tertiary" aria-live="polite">
          {hoverNote}
        </p>
      )}
      <div className="motion-surface motion-surface-lift h-44 w-full min-w-0 rounded-xl border border-border bg-surface">
        <Liveline
          theme="light"
          color={COLOR}
          data={data}
          value={value}
          grid
          scrub
          showValue
          lerpSpeed={0.08}
          padding={{ top: 12, right: 54, bottom: 28, left: 12 }}
          formatValue={(v) => `${Math.round(v)} / 100`}
          formatTime={(t) => {
            const d = new Date(t * 1000);
            return d.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }}
          referenceLine={{ value: 50, label: "Neutral" }}
          cursor="crosshair"
          onHover={(pt) => {
            if (!pt) {
              setHoverNote(null);
              return;
            }
            setHoverNote(
              `${Math.round(pt.value)} / 100 · ${new Date(pt.time * 1000).toLocaleString()}`
            );
          }}
          window={windowSecs}
          className="h-full w-full min-h-0 rounded-[inherit]"
          style={{ minHeight: 160 }}
        />
      </div>
    </div>
  );
}

export default RecentHistoryChart;
