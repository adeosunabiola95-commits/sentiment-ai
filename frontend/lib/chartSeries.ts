/** Deterministic mock series for the sentiment chart (no external price API yet). */

import type { LivelinePoint } from "liveline";

export type SentimentPoint = {
  label: string;
  sentiment: number;
  bias: number;
};

/** Spacing between seeded points (2h) to match 12 buckets over ~24h. */
export const CHART_STEP_MS = 2 * 60 * 60 * 1000;

function hashPair(pair: string) {
  let h = 0;
  for (let i = 0; i < pair.length; i++) {
    h = (Math.imul(31, h) + pair.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededNoise(seed: number, i: number) {
  const x = Math.sin(seed * 9999 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * 12 points (0–22h). When `confidence` is set, the last point snaps to it
 * so the chart reflects the latest AI read.
 */
export function buildSentimentSeries(
  pair: string,
  confidence: number | null
): SentimentPoint[] {
  const seed = hashPair(pair);
  const points: SentimentPoint[] = [];
  let prevS = 52 + (seed % 18);
  let prevB = 48 + (seed % 15);

  for (let h = 0; h < 12; h++) {
    const label = `${String(h * 2).padStart(2, "0")}:00`;
    const n1 = seededNoise(seed, h);
    const n2 = seededNoise(seed + 1, h);
    prevS = Math.max(
      18,
      Math.min(92, prevS + (n1 - 0.48) * 14)
    );
    prevB = Math.max(
      15,
      Math.min(90, prevB + (n2 - 0.52) * 12)
    );
    points.push({ label, sentiment: Math.round(prevS), bias: Math.round(prevB) });
  }

  if (confidence != null) {
    const c = Math.max(0, Math.min(100, Math.round(confidence)));
    const last = points[points.length - 1];
    last.sentiment = c;
    last.bias = Math.max(0, Math.min(100, Math.round(c + (seed % 7) - 3)));
  }

  return points;
}

/**
 * Maps seeded points to Liveline `{ time, value }` arrays ending at `endMs`.
 * Liveline expects `time` in **seconds** (same as its internal `now`); we convert from ms.
 */
export function sentimentToLiveline(
  points: SentimentPoint[],
  endMs: number,
  stepMs: number
): { sentiment: LivelinePoint[]; bias: LivelinePoint[] } {
  const n = points.length;
  const sentiment: LivelinePoint[] = [];
  const bias: LivelinePoint[] = [];
  for (let i = 0; i < n; i++) {
    const tMs = endMs - (n - 1 - i) * stepMs;
    const t = tMs / 1000;
    sentiment.push({ time: t, value: points[i].sentiment });
    bias.push({ time: t, value: points[i].bias });
  }
  return { sentiment, bias };
}
