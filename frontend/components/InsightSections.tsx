"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AnalysisResult } from "@/lib/types";
import { fetchNewsHeadlines, type NewsHeadlinesResponse } from "@/lib/api";
import {
  InsightBottomSheet,
  buildSheetPayload,
} from "@/components/InsightBottomSheet";

const cardShell = "w-full rounded-2xl bg-surface px-0 py-4 sm:py-5";

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-sm font-medium tracking-tight text-text-primary">{children}</h2>
  );
}

function PillRow({
  children,
  right,
  onClick,
}: {
  children: ReactNode;
  right?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="motion-pill-row flex w-full min-w-0 items-center justify-between gap-3 rounded-full bg-elevated px-4 py-2.5 text-left text-sm text-text-primary"
    >
      <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap leading-snug [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {right != null && (
        <span className="shrink-0 text-xs tabular-nums text-text-tertiary">{right}</span>
      )}
    </button>
  );
}

export function InsightSections({ data }: { data: AnalysisResult }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetDetail, setSheetDetail] = useState("");

  const cachedHeadlines = data.mock?.headlines ?? [];

  const [remoteNews, setRemoteNews] = useState<NewsHeadlinesResponse | null>(null);

  useEffect(() => {
    setRemoteNews(null);
  }, [data.pair]);

  useEffect(() => {
    let cancelled = false;
    fetchNewsHeadlines(data.pair)
      .then((r) => {
        if (!cancelled) setRemoteNews(r);
      })
      .catch(() => {
        if (!cancelled) setRemoteNews(null);
      });
    return () => {
      cancelled = true;
    };
  }, [data.pair]);

  const headlines = useMemo(() => {
    if (remoteNews?.headlines?.length) return remoteNews.headlines;
    return cachedHeadlines;
  }, [cachedHeadlines, remoteNews]);

  const newsSource = remoteNews?.source ?? data.sources?.news;

  const openSheet = useCallback((title: string, detail: string) => {
    setSheetTitle(title);
    setSheetDetail(detail);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const payload = sheetOpen
    ? buildSheetPayload(sheetTitle, sheetDetail, headlines, newsSource)
    : null;

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="flex w-full min-w-0 flex-col gap-4">
          <section className={cardShell}>
            <CardTitle>Key drivers</CardTitle>
            <div className="mt-3 flex flex-col gap-2">
              {data.drivers.map((d, i) => (
                <PillRow
                  key={i}
                  right={i + 1}
                  onClick={() => openSheet("Key driver", d)}
                >
                  {d}
                </PillRow>
              ))}
            </div>
          </section>

          <section className={cardShell}>
            <CardTitle>Market context</CardTitle>
            <button
              type="button"
              onClick={() =>
                openSheet("Market context", data.market_context)
              }
              className="motion-pill-row mt-3 w-full overflow-x-auto whitespace-nowrap rounded-full bg-elevated px-4 py-3 text-left text-sm text-text-primary [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {data.market_context}
            </button>
          </section>
        </div>

        <section className={cardShell}>
          <CardTitle>Risk factors</CardTitle>
          <div className="mt-3">
            <div className="mb-2.5 grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border-hairline pb-2.5 text-xs font-medium text-text-tertiary">
              <span>Risk</span>
              <span className="text-right">Ref</span>
            </div>
            <div className="flex flex-col gap-2">
              {data.risk_factors.map((r, i) => (
                <PillRow
                  key={i}
                  right={i + 1}
                  onClick={() => openSheet("Risk factor", r)}
                >
                  {r}
                </PillRow>
              ))}
            </div>
          </div>
        </section>
      </div>

      <InsightBottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        payload={payload}
      />
    </>
  );
}
