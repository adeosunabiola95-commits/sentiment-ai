"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  InsightToast,
  type InsightToastPayload,
} from "@/components/InsightToast";
import { analyzePair } from "@/lib/api";
import { saveHistoryEntry, loadHistory } from "@/lib/history";
import { buildSentimentSeries } from "@/lib/chartSeries";
import { isValidCurrencyPair } from "@/lib/validCurrencyPairs";
import type { AnalysisResult, HistoryEntry } from "@/lib/types";
import { AnalysisResultView } from "@/components/AnalysisResult";
import { DocsLayout } from "@/components/DocsLayout";
import { ErrorToast } from "@/components/ErrorToast";
import { FloatingAnalyzeBar } from "@/components/FloatingAnalyzeBar";
import { useAppHaptics } from "@/components/HapticsProvider";
import { LoadingState } from "@/components/LoadingState";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";
import { MetricStrip } from "@/components/MetricStrip";
const SentimentChart = dynamic(() => import("@/components/SentimentChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[min(52vh,360px)] min-h-[240px] w-full animate-pulse rounded-xl border border-border bg-elevated" />
  ),
});

const RecentHistoryChart = dynamic(() => import("@/components/RecentHistoryChart"), {
  ssr: false,
  loading: () => (
    <div className="mb-4 h-44 w-full animate-pulse rounded-xl border border-border bg-elevated" />
  ),
});


/** Same max width as value overlay / metric cards — all page sections use this */
const contentMaxClass = "max-w-2xl";

const sectionClass = "scroll-mt-28 lg:scroll-mt-10";
/** Title + base text (reference: section headers vs body) */
const sectionTitleClass = "text-lg font-medium tracking-tight text-text-primary";
const sectionBodyClass = "mt-1.5 text-sm font-normal text-text-secondary";

function normalizeInput(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

/** Custom pattern when a pair analysis loads successfully (web-haptics). */
const PAIR_LOADED_HAPTIC = [
  { duration: 40, intensity: 0.7 },
  { delay: 40, duration: 40, intensity: 0.7 },
  { delay: 40, duration: 40, intensity: 0.9 },
  { delay: 40, duration: 50, intensity: 0.6 },
];

export default function Home() {
  const { trigger: haptic } = useAppHaptics();
  const [pair, setPair] = useState("");
  const [activePair, setActivePair] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pairInputInvalid, setPairInputInvalid] = useState(false);
  const [pairInputShakeKey, setPairInputShakeKey] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [insightToast, setInsightToast] = useState<InsightToastPayload | null>(
    null
  );

  const dismissInsight = useCallback(() => setInsightToast(null), []);

  const dismissError = useCallback(() => setError(null), []);

  const runAnalyze = useCallback(async (targetPair: string, opts?: { silent?: boolean }) => {
    const normalized = normalizeInput(targetPair);
    if (normalized.length !== 6) {
      setError("Enter a valid pair (e.g. USDJPY).");
      if (!opts?.silent) {
        void haptic("error");
        setPairInputInvalid(true);
        setPairInputShakeKey((k) => k + 1);
      }
      return;
    }
    if (!isValidCurrencyPair(normalized)) {
      setError(
        "Unknown currency pair. Use two supported ISO codes (e.g. EURUSD, USDJPY)."
      );
      if (!opts?.silent) {
        void haptic("error");
        setPairInputInvalid(true);
        setPairInputShakeKey((k) => k + 1);
      }
      return;
    }
    setError(null);
    setPairInputInvalid(false);
    setLoading(true);
    try {
      const data = await analyzePair(normalized);
      setResult(data);
      setActivePair(data.pair);
      setPair(data.pair);
      const entry: HistoryEntry = {
        pair: data.pair,
        sentiment: data.sentiment,
        summary: data.summary,
        at: new Date().toISOString(),
      };
      setHistory(saveHistoryEntry(entry));
      if (!opts?.silent) {
        void haptic(PAIR_LOADED_HAPTIC);
        setInsightToast({
          id: Date.now(),
          kind: "analysis",
          pair: data.pair,
          title: `${data.pair} · ${data.sentiment}`,
          body: data.summary,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      if (!opts?.silent) {
        void haptic("error");
        setPairInputInvalid(true);
        setPairInputShakeKey((k) => k + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [haptic]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  /** Push news toasts from anywhere: `window.dispatchEvent(new CustomEvent('sentiment:news', { detail: { title?: string, body: string } }))` */
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ title?: string; body: string }>;
      const d = ce.detail;
      if (!d?.body) return;
      setInsightToast({
        id: Date.now(),
        kind: "news",
        title: d.title ?? "News",
        body: d.body,
      });
    };
    window.addEventListener("sentiment:news", handler);
    return () => window.removeEventListener("sentiment:news", handler);
  }, []);

  const chartData = useMemo(
    () =>
      buildSentimentSeries(
        activePair,
        result?.pair === activePair ? result.confidence : null
      ),
    [activePair, result]
  );

  const handlePairChange = useCallback((v: string) => {
    setPair(v);
    setPairInputInvalid(false);
    setError(null);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runAnalyze(pair);
  }

  return (
    <DocsLayout>
      <>
      <main
        className={`mx-auto flex w-full flex-1 flex-col gap-10 px-4 pb-36 pt-4 sm:px-6 lg:px-8 lg:pt-10 ${contentMaxClass}`}
      >
        <section id="getting-started" className={sectionClass}>
          <h2 className="sr-only">Getting started</h2>
          <header className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={sectionTitleClass}>Sentiment.ai</h1>
              <MarketStatusBadge />
            </div>
            <p className={sectionBodyClass}>
              Live sentiment index and AI breakdown — choose a pair in the bar below or type a
              six-letter code (e.g. EURUSD). Use the sidebar index to navigate.
            </p>
          </header>
          {loading && !result && (
            <div className="mt-4">
              <LoadingState />
            </div>
          )}
          {loading && result && (
            <p className="mt-4 text-center text-sm text-text-secondary">Refreshing…</p>
          )}
        </section>

        <section
          id="sentiment-chart"
          className={sectionClass}
          aria-label="Sentiment chart"
        >
          <SentimentChart
            key={`${activePair}-${result?.pair === activePair ? String(result.confidence) : "pending"}`}
            pair={activePair}
            seedPoints={chartData}
            sentiment={
              result?.pair === activePair ? result.sentiment : "Neutral"
            }
          />
        </section>

        <section
          id="insights"
          className={`${sectionClass} flex flex-col gap-6`}
          aria-label="Analysis and metrics"
        >
          {result && result.pair === activePair && <MetricStrip data={result} />}

          {!loading && result && result.pair === activePair && (
            <AnalysisResultView data={result} showHeader={false} />
          )}
        </section>

        <section id="recent-analyses" className={sectionClass}>
          <h2 className={`${sectionTitleClass} mb-3`}>Recent analyses</h2>
          {history.length > 0 ? (
            <>
              <RecentHistoryChart pair={activePair} history={history} />
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li
                    key={`${h.pair}-${h.at}-${i}`}
                    className="motion-surface motion-surface-lift flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border-hairline bg-surface px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-text-primary">{h.pair}</span>
                    <span className="text-text-tertiary">
                      {new Date(h.at).toLocaleString()}
                    </span>
                    <span className="w-full text-text-secondary line-clamp-2">
                      {h.sentiment} — {h.summary}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-text-secondary">
              Run an analysis to build history — entries appear here with sentiment and time.
            </p>
          )}
        </section>

        <div id="analyze" className="h-px w-full scroll-mt-32 shrink-0 lg:scroll-mt-10" />

        <FloatingAnalyzeBar
          pair={pair}
          onPairChange={handlePairChange}
          onSubmit={onSubmit}
          loading={loading}
          pairInputInvalid={pairInputInvalid}
          pairInputShakeKey={pairInputShakeKey}
        />
      </main>
      <ErrorToast message={error} onDismiss={dismissError} />
      <InsightToast toast={insightToast} onDismiss={dismissInsight} />
      </>
    </DocsLayout>
  );
}
