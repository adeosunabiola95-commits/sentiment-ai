"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import { confidenceColorClasses } from "@/lib/sentimentColors";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-text-secondary">
      {children}
      <span aria-hidden className="text-text-tertiary">
        ›
      </span>
    </span>
  );
}

function CardShell({
  title,
  badge,
  children,
}: {
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="motion-surface motion-surface-lift flex flex-col rounded-xl border border-border bg-surface p-3.5 shadow-[0_1px_1px_rgba(15,23,42,0.024)]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h3 className="text-xs font-medium text-text-primary">{title}</h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function ConfidenceDonut({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const targetPct = Math.min(100, Math.max(0, value));
  const { stroke, text } = confidenceColorClasses(value);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const startedRef = useRef(false);
  const [animT, setAnimT] = useState(0);
  const [run, setRun] = useState(false);

  const kick = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setRun(true);
  }, []);

  useEffect(() => {
    startedRef.current = false;
    setAnimT(0);
    setRun(false);
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) kick();
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top < vh * 0.88 && rect.bottom > rect.height * 0.2) {
        kick();
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [targetPct, kick]);

  useEffect(() => {
    if (!run) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setAnimT(1);
      return;
    }
    setAnimT(0);
    const duration = 900;
    const t0 = performance.now();
    const step = (now: number) => {
      const raw = Math.min(1, (now - t0) / duration);
      setAnimT(easeOutCubic(raw));
      if (raw < 1) animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [run]);

  const pct = targetPct * animT;
  const offset = c * (1 - pct / 100);

  const label =
    targetPct >= 70
      ? "Strong signal"
      : targetPct >= 40
        ? "Moderate"
        : "Needs context";

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3"
    >
      <div
        className={`relative flex h-[calc(4rem*1.04)] w-[calc(4rem*1.04)] shrink-0 items-center justify-center sm:h-[calc(4.25rem*1.04)] sm:w-[calc(4.25rem*1.04)] ${stroke}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            className="text-border"
            stroke="currentColor"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="text-current"
            stroke="currentColor"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-0.5">
          <span className="text-[0.675rem] font-semibold leading-none tabular-nums text-text-primary sm:text-[0.7rem]">
            {Math.round(pct)}
            <span className="text-[0.525rem] font-semibold sm:text-[0.55rem]">%</span>
          </span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${text}`}>{label}</p>
        <p className="mt-0.5 text-xs font-normal leading-snug text-text-secondary">
          Model confidence in this pair read — higher means tighter agreement across drivers.
        </p>
      </div>
    </div>
  );
}

function DotRow() {
  return (
    <div className="mt-2.5 flex gap-1" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-sky-200/90"
          style={{ opacity: 0.35 + (i % 4) * 0.15 }}
        />
      ))}
    </div>
  );
}

export function MetricStrip({ data }: { data: AnalysisResult }) {
  const trend = data.mock?.trend ?? "—";
  const volatility = data.mock?.volatility ?? "—";

  return (
    <div className="grid w-full grid-cols-2 gap-[15px] sm:gap-[17px]">
      <CardShell title="Sentiment" badge={<Badge>Signal</Badge>}>
        <div>
          <p className="text-sm font-semibold text-text-primary">
            <span className="capitalize">{data.sentiment.toLowerCase()}</span>
            <span className="font-normal text-text-secondary"> bias</span>
          </p>
          <p className="mt-0.5 text-xs font-normal text-text-secondary">
            Directional read from headlines and mock trend context for {data.pair}.
          </p>
        </div>
        <DotRow />
      </CardShell>

      <CardShell title="Confidence" badge={<Badge>Score</Badge>}>
        <ConfidenceDonut value={data.confidence} />
      </CardShell>

      <CardShell title="Trend" badge={<Badge>Momentum</Badge>}>
        <p className="text-sm font-semibold capitalize text-text-primary">{trend}</p>
        <p className="mt-0.5 text-xs font-normal text-text-secondary">
          Short-horizon mock trend attached to this analysis run.
        </p>
        <DotRow />
      </CardShell>

      <CardShell title="Volatility" badge={<Badge>Range</Badge>}>
        <p className="text-sm font-semibold capitalize text-text-primary">{volatility}</p>
        <p className="mt-0.5 text-xs font-normal text-text-secondary">
          Heuristic regime label for how choppy the mock series behaves.
        </p>
        <DotRow />
      </CardShell>
    </div>
  );
}
