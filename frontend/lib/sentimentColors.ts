import type { Sentiment } from "./types";

/** Solid fills for FX pill / chart overlays — matches bias: bull green, bear red, neutral amber. */
export const SENTIMENT_FILL_HEX: Record<Sentiment, string> = {
  Bullish: "#16a34a",
  Bearish: "#dc2626",
  Neutral: "#d97706",
};

export function sentimentFillHex(sentiment: Sentiment): string {
  return SENTIMENT_FILL_HEX[sentiment];
}

/** Confidence tiers for donut + numeric display (not bias). */
export function confidenceTier(confidence: number): "high" | "mid" | "low" {
  const c = Math.min(100, Math.max(0, confidence));
  if (c >= 70) return "high";
  if (c >= 40) return "mid";
  return "low";
}

/** Tailwind classes for confidence-driven color (high = green, mid = amber, low = red). */
export function confidenceColorClasses(confidence: number): {
  stroke: string;
  text: string;
} {
  switch (confidenceTier(confidence)) {
    case "high":
      return { stroke: "text-emerald-500", text: "text-emerald-600" };
    case "mid":
      return { stroke: "text-amber-500", text: "text-amber-600" };
    default:
      return { stroke: "text-red-500", text: "text-red-600" };
  }
}
