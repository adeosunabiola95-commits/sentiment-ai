"use client";

import { Liveline } from "liveline";
import type { LivelinePoint } from "liveline";
import { useEffect, useMemo, useState } from "react";
import {
  fetchForexDaily,
  fetchForexLatest,
  type ForexDaily,
} from "@/lib/api";
import { FxPriceBadge } from "@/components/FxPriceBadge";
import { PairFlagCluster } from "@/components/PairFlagCluster";
import { CHART_STEP_MS, sentimentToLiveline } from "@/lib/chartSeries";
import type { SentimentPoint } from "@/lib/chartSeries";
import type { Sentiment } from "@/lib/types";

const COLOR_SENTIMENT = "#6366f1";
const COLOR_BIAS = "#93c5fd";

const LIVE_INTERVAL_MS = 4000;
const LIVE_JITTER = 2.2;
const FOREX_POLL_MS = 5000;

const useLiveForex =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_ENABLE_FOREX === "1";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function jitter(prev: number, salt: number) {
  const wobble =
    (Math.sin(salt * 0.001 + Date.now() * 0.0004) * 0.5 +
      Math.cos(salt * 0.002) * 0.5 -
      0.5) *
    LIVE_JITTER;
  return clamp(prev + wobble, 0, 100);
}

function buildInitial(seedPoints: SentimentPoint[]) {
  return sentimentToLiveline(seedPoints, Date.now(), CHART_STEP_MS);
}

function SentimentChart({
  pair,
  seedPoints,
  sentiment,
}: {
  pair: string;
  seedPoints: SentimentPoint[];
  sentiment: Sentiment;
}) {
  const [sentimentData, setSentimentData] = useState<LivelinePoint[]>(() =>
    buildInitial(seedPoints).sentiment
  );
  const [biasData, setBiasData] = useState<LivelinePoint[]>(() =>
    buildInitial(seedPoints).bias
  );
  const [windowSecs, setWindowSecs] = useState(24 * 3600);
  const [fxDaily, setFxDaily] = useState<ForexDaily | null>(null);
  const [fxLoading, setFxLoading] = useState(false);
  const [fxOverlay, setFxOverlay] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const sentValue = sentimentData[sentimentData.length - 1]?.value ?? 0;
  const biasValue = biasData[biasData.length - 1]?.value ?? 0;
  const loading = sentimentData.length === 0;

  const seedKey = useMemo(() => JSON.stringify(seedPoints), [seedPoints]);

  useEffect(() => {
    const initial = buildInitial(seedPoints);
    setSentimentData(initial.sentiment);
    setBiasData(initial.bias);
  }, [seedKey, seedPoints]);

  const pairReady = pair.length === 6;

  useEffect(() => {
    const id = window.setInterval(() => {
      const nowSec = Date.now() / 1000;
      setSentimentData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const v = jitter(last.value, last.time);
        return [...prev, { time: nowSec, value: v }].slice(-96);
      });
      if (!useLiveForex) {
        setBiasData((prev) => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          const v = jitter(last.value, last.time + 17);
          return [...prev, { time: nowSec, value: v }].slice(-96);
        });
      }
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pair, pairReady]);

  useEffect(() => {
    if (!useLiveForex || !pairReady) return;
    let cancelled = false;
    let minR = Infinity;
    let maxR = -Infinity;

    const pushRate = (rate: number, timeMs: number) => {
      const nowSec = timeMs / 1000;
      minR = Math.min(minR, rate);
      maxR = Math.max(maxR, rate);
      const span = maxR - minR || 1;
      const norm = ((rate - minR) / span) * 100;
      setBiasData((prev) => {
        if (prev.length === 0) {
          return [{ time: nowSec, value: norm }];
        }
        return [...prev, { time: nowSec, value: norm }].slice(-96);
      });
    };

    const tick = async () => {
      try {
        const { rate, time } = await fetchForexLatest(pair);
        if (cancelled) return;
        pushRate(rate, time);
      } catch {
        /* keep last series; next tick may succeed */
      }
    };

    void tick();
    const interval = window.setInterval(tick, FOREX_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pair, pairReady]);

  useEffect(() => {
    let cancelled = false;
    setFxDaily(null);
    setFxOverlay(false);
    setFxLoading(false);
    if (!pairReady) return;
    setFxLoading(true);
    async function load() {
      try {
        const data = await fetchForexDaily(pair);
        if (cancelled) return;
        setFxDaily(data);
        setFxOverlay(true);
      } catch {
        if (!cancelled) {
          setFxDaily(null);
          setFxOverlay(false);
        }
      } finally {
        if (!cancelled) setFxLoading(false);
      }
    }
    void load();
    const id = window.setInterval(() => {
      void load();
    }, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pair, pairReady]);

  const series = useMemo(
    () => [
      {
        id: "sentiment",
        data: sentimentData,
        value: sentValue,
        color: COLOR_SENTIMENT,
        label: "AI sentiment",
      },
      {
        id: "bias",
        data: biasData,
        value: biasValue,
        color: COLOR_BIAS,
        label: useLiveForex ? "FX mid (normalized)" : "News bias",
      },
    ],
    [sentimentData, biasData, sentValue, biasValue]
  );

  const chartPadding = { left: 0, top: 8, bottom: 28, right: 54 };
  const windowOptions = [
    { label: "24h", secs: 24 * 3600 },
    { label: "6h", secs: 6 * 3600 },
    { label: "1h", secs: 3600 },
  ] as const;

  const biasTitle = useLiveForex ? "FX mid (normalized)" : "News bias";
  const biasExplain = useLiveForex
    ? "Live bid/ask midpoint for this pair, scaled to 0–100 so it sits on the same axis as sentiment."
    : "A second 0–100 series that tracks how media tone skews (simulated here). Use it next to AI sentiment to spot divergence.";

  return (
    <div className="motion-surface motion-surface-lift w-full min-w-0 overflow-x-hidden overflow-y-visible rounded-xl border border-border bg-surface p-4 shadow-[0px_4px_12px_rgba(15,23,42,0.036)] sm:p-5">
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Live sentiment index
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-2.5">
            {pairReady ? <PairFlagCluster pair={pair} /> : null}
            <p className="text-lg font-medium tracking-tight text-text-primary">
              {pairReady ? pair : "Select pair"}
            </p>
          </div>
        </div>

        <div className="relative isolate h-[min(52vh,380px)] w-full min-h-[260px] min-w-0 overflow-x-hidden overflow-y-visible rounded-lg">
          <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden">
            <Liveline
              theme="light"
              color={COLOR_SENTIMENT}
              data={sentimentData}
              value={sentValue}
              series={series}
              loading={loading}
              grid
              fill
              momentum
              scrub
              showValue
              formatValue={(v) => `${Math.round(v)}`}
              windows={[...windowOptions]}
              windowStyle="rounded"
              window={windowSecs}
              onWindowChange={setWindowSecs}
              badgeVariant="minimal"
              padding={chartPadding}
              className="relative z-0 h-full w-full min-h-0 max-w-full rounded-lg [&_canvas]:block [&_canvas]:max-h-full [&_canvas]:max-w-full"
              style={{ minHeight: 260 }}
            />
          </div>
          {pairReady && (fxOverlay || fxLoading) && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex w-full items-center pt-14 pb-8 pr-2 sm:pt-16"
              role="status"
              aria-live="polite"
            >
              <FxPriceBadge
                pairLabel={`${pair.slice(0, 3)}/${pair.slice(3, 6)}`}
                rate={fxDaily?.rate ?? 0}
                quote={fxDaily?.quote ?? pair.slice(3, 6)}
                changePct={fxDaily?.changePct ?? 0}
                sentiment={sentiment}
                loading={fxLoading}
              />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[100] flex justify-center px-2 pb-1.5 pt-0">
            <div
              className={`pointer-events-auto w-full overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_-6px_20px_rgba(15,23,42,0.1)] transition-[max-width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-75 ${
                learnMoreOpen
                  ? "max-w-[min(28rem,100%)]"
                  : "max-w-[9.8rem]"
              }`}
            >
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-75 ${
                  learnMoreOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    role="region"
                    aria-labelledby="sentiment-legend-toggle"
                    aria-hidden={!learnMoreOpen}
                    className={`border-b border-border px-3 pb-4 pt-4 transition-opacity duration-200 ease-out motion-reduce:transition-none sm:px-5 sm:pb-5 sm:pt-5 ${
                      learnMoreOpen
                        ? "pointer-events-auto opacity-100 delay-75 motion-reduce:delay-0"
                        : "pointer-events-none opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-4">
                        <div className="flex min-w-0 max-w-md gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: COLOR_SENTIMENT }}
                            aria-hidden
                          />
                          <div>
                            <p className="text-xs font-medium text-text-primary">
                              AI sentiment
                            </p>
                            <p className="text-xs leading-relaxed text-text-secondary">
                              The model&apos;s read of how bullish or bearish the
                              narrative feels, on a 0–100 scale. Higher usually
                              means more constructive tone.
                            </p>
                          </div>
                        </div>
                        <div className="flex min-w-0 max-w-md gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: COLOR_BIAS }}
                            aria-hidden
                          />
                          <div>
                            <p className="text-xs font-medium text-text-primary">
                              {biasTitle}
                            </p>
                            <p className="text-xs leading-relaxed text-text-secondary">
                              {biasExplain}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-text-tertiary">
                        <span className="font-medium text-text-secondary">
                          Reading the chart:
                        </span>{" "}
                        The purple line is AI sentiment; the blue line is{" "}
                        {useLiveForex ? "live FX (normalized)" : "news bias"}.
                        When they move together, narrative and that second signal
                        are aligned; when they diverge, compare which one is
                        leading.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLearnMoreOpen((o) => !o)}
                className="motion-press-tint flex w-full items-center justify-between gap-3 bg-elevated/80 px-3 py-2.5 text-left hover:bg-elevated sm:px-4 sm:py-3"
                aria-expanded={learnMoreOpen}
                id="sentiment-legend-toggle"
              >
                <span className="text-sm font-normal text-text-secondary">
                  {learnMoreOpen ? "Show less" : "Learn more"}
                </span>
                <span className="shrink-0 text-text-tertiary" aria-hidden>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-75 ${learnMoreOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SentimentChart;
