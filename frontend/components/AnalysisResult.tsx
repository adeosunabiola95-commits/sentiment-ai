import type { AnalysisResult as Result } from "@/lib/types";
import { confidenceColorClasses } from "@/lib/sentimentColors";
import { InsightSections } from "./InsightSections";
import { SentimentBadge } from "./SentimentBadge";
import { SectionCard } from "./SectionCard";

export function AnalysisResultView({
  data,
  showHeader = true,
}: {
  data: Result;
  showHeader?: boolean;
}) {
  const confTone = confidenceColorClasses(data.confidence).text;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {showHeader && (
        <div className="motion-surface motion-surface-lift flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-[0px_4px_12px_rgba(15,23,42,0.036)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-lg font-medium tabular-nums text-text-primary">
              {data.pair}
            </span>
            <SentimentBadge sentiment={data.sentiment} />
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Confidence
            </p>
            <p className={`text-2xl font-medium tabular-nums ${confTone}`}>
              {data.confidence}
              <span className={`text-lg ${confTone} opacity-80`}>%</span>
            </p>
          </div>
        </div>
      )}

      <InsightSections data={data} />

      <SectionCard id="summary" title="Summary">
        <p className="leading-relaxed text-text-primary">{data.summary}</p>
      </SectionCard>

      {data.mock && (
        <p className="text-center text-xs text-text-tertiary">
          Mock inputs: trend {data.mock.trend}, volatility {data.mock.volatility}
        </p>
      )}
    </div>
  );
}
