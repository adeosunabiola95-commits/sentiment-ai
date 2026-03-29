import type { Sentiment } from "@/lib/types";

const styles: Record<Sentiment, string> = {
  Bullish: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/48",
  Bearish: "bg-red-50 text-red-700 ring-1 ring-red-200/48",
  Neutral: "bg-gray-100 text-gray-600 ring-1 ring-gray-200/48",
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold tabular-nums transition-[color,background-color,box-shadow] duration-150 ease-out ${styles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}
