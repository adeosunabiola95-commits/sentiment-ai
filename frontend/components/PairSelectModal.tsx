"use client";

import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import {
  PAIR_CATEGORY_TABS,
  PAIR_LIST_DISPLAY_CAP,
  PRESET_PAIRS,
  filterPairCatalog,
  formatPairSlash,
  type PairCategoryId,
} from "@/lib/pairCatalog";
import { IconButton, SearchField } from "@/components/ui";
import { PairFlagCluster } from "@/components/PairFlagCluster";
import { currencyToFlagCountryCode, splitPairCurrencies } from "@/lib/currencyFlags";
import { fetchForexDaily, type ForexDaily } from "@/lib/api";
import { useAppHaptics } from "@/components/HapticsProvider";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/ds";

/** Shared layout morph — spring while opening / visible (emil-design-eng). */
const LAYOUT_MORPH_ENTER = {
  type: "spring" as const,
  duration: 0.24,
  bounce: 0.12,
};

/** Morph back to pill on close — quick ease-out, no springy settle. */
const LAYOUT_MORPH_EXIT = {
  type: "tween" as const,
  duration: 0.18,
  ease: [0.4, 0, 0.2, 1] as const,
};

function PairSelectModalSurface({
  sharedLayoutId,
  layoutEnabled,
  children,
}: {
  sharedLayoutId: string | undefined;
  layoutEnabled: boolean;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  const transition = isPresent ? LAYOUT_MORPH_ENTER : LAYOUT_MORPH_EXIT;
  return (
    <motion.div
      layoutId={sharedLayoutId}
      layout={layoutEnabled}
      className={ds.surface.modalPanel}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  /** Fires after exit animation (used to re-enable layoutId on trigger). */
  onExitComplete?: () => void;
  onSelect: (pair: string) => void;
  currentPair: string;
  /** Shared layout id for morph from quick-select pill (omit when reduced motion). */
  layoutId?: string;
};

export function PairSelectModal({
  open,
  onClose,
  onExitComplete,
  onSelect,
  currentPair,
  layoutId,
}: Props) {
  const { trigger: haptic } = useAppHaptics();
  const titleId = useId();
  const searchFieldId = useId();
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState<PairCategoryId>("all");
  const [query, setQuery] = useState("");
  const [pairQuotes, setPairQuotes] = useState<
    Record<string, ForexDaily | null | "pending">
  >({});
  const reduceMotion = useReducedMotion();
  const sharedLayoutId = layoutId && !reduceMotion ? layoutId : undefined;

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const closeModal = useCallback(() => {
    setQuery("");
    setCategory("all");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  /** Deferred so keystrokes stay instant while substring search runs on large pools. */
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => filterPairCatalog(deferredQuery, category),
    [deferredQuery, category]
  );
  const searchFilterPending = query !== deferredQuery;

  const presetSet = useMemo(() => new Set<string>(PRESET_PAIRS), []);

  /** Cap rows + quotes so we never mount 6k+ rows or fire 6k API calls. */
  const displayList = useMemo(() => {
    if (filtered.length <= PAIR_LIST_DISPLAY_CAP) return filtered;
    const presetInFiltered = filtered.filter((p) => presetSet.has(p));
    const rest = filtered.filter((p) => !presetSet.has(p));
    return [...presetInFiltered, ...rest].slice(0, PAIR_LIST_DISPLAY_CAP);
  }, [filtered, presetSet]);

  const popularRows = useMemo(
    () => displayList.filter((p) => presetSet.has(p)),
    [displayList, presetSet]
  );
  const moreRows = useMemo(
    () => displayList.filter((p) => !presetSet.has(p)),
    [displayList, presetSet]
  );

  const handlePickPair = useCallback(
    (pair: string) => {
      void haptic("selection");
      onSelect(pair);
      closeModal();
    },
    [haptic, onSelect, closeModal]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const pairs = [...displayList];
    startTransition(() => {
      setPairQuotes(() => {
        const next: Record<string, ForexDaily | null | "pending"> = {};
        for (const p of pairs) next[p] = "pending";
        return next;
      });
    });

    const chunkSize = 6;
    (async () => {
      for (let i = 0; i < pairs.length; i += chunkSize) {
        if (cancelled) return;
        const slice = pairs.slice(i, i + chunkSize);
        const settled = await Promise.allSettled(
          slice.map((p) => fetchForexDaily(p))
        );
        if (cancelled) return;
        setPairQuotes((prev) => {
          const next = { ...prev };
          slice.forEach((p, j) => {
            const r = settled[j];
            next[p] =
              r.status === "fulfilled" ? r.value : null;
          });
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, displayList]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="popLayout" onExitComplete={onExitComplete}>
      {open && (
        <motion.div
          key="pair-select-modal"
          className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <motion.button
            type="button"
            layout={false}
            className="absolute inset-0 bg-black/40 motion-reduce:transition-none"
            aria-label="Close"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.12,
              ease: [0.23, 1, 0.32, 1],
            }}
          />
          <PairSelectModalSurface
            sharedLayoutId={sharedLayoutId}
            layoutEnabled={!!sharedLayoutId}
          >
        <div className={ds.layout.modalHeaderRow}>
          <h2 id={titleId} className={ds.typography.title}>
            Currency pairs
          </h2>
          <IconButton
            type="button"
            variant="ghost"
            label="Close"
            onClick={closeModal}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </IconButton>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col sm:flex-row">
          <nav
            className={ds.layout.modalNav}
            aria-label="Pair categories"
          >
            {PAIR_CATEGORY_TABS.map(({ id, label }) => {
              const active = category === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={cn(
                    active ? ds.button.tabActive : ds.button.tabInactive
                  )}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className={ds.layout.searchRow}>
              <SearchField
                id={searchFieldId}
                label="Search pairs"
                value={query}
                onChange={(v) => setQuery(v.toUpperCase())}
                placeholder="Search pairs (e.g. EUR, USDJPY)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.2-3.2" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>

            {filtered.length > PAIR_LIST_DISPLAY_CAP && (
              <p className="shrink-0 border-b border-border-hairline bg-elevated/50 px-3 py-2 text-[11px] leading-snug text-text-secondary sm:px-4">
                Showing {PAIR_LIST_DISPLAY_CAP} of {filtered.length.toLocaleString()} pairs — refine
                search or use a category tab.
              </p>
            )}

            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4 pt-1 transition-opacity duration-150 motion-reduce:transition-none sm:px-3 ${
                searchFilterPending ? "opacity-[0.72]" : ""
              }`}
              aria-busy={searchFilterPending}
              aria-label="Pair search results"
            >
              {filtered.length === 0 ? (
                <p className={cn("px-2 py-8", ds.typography.emptyState)}>
                  No pairs match your search.
                </p>
              ) : (
                <>
                  {popularRows.length > 0 && (
                    <section className="mb-1">
                      <p className={cn("px-2 pb-2 pt-1", ds.typography.overline)}>
                        Popular
                      </p>
                      <ul className="space-y-0.5">
                        {popularRows.map((p) => (
                          <li key={p}>
                            <PairRow
                              pair={p}
                              selected={p === currentPair}
                              onPick={handlePickPair}
                              quote={pairQuotes[p]}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {moreRows.length > 0 && (
                    <section className={popularRows.length > 0 ? "mt-3" : ""}>
                      <p className={cn("px-2 pb-2 pt-1", ds.typography.overline)}>
                        {popularRows.length > 0 ? "More pairs" : "All pairs"}
                      </p>
                      <ul className="space-y-0.5">
                        {moreRows.map((p) => (
                          <li key={p}>
                            <PairRow
                              pair={p}
                              selected={p === currentPair}
                              onPick={handlePickPair}
                              quote={pairQuotes[p]}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
          </PairSelectModalSurface>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function formatSpotRate(d: ForexDaily): string {
  const q = d.quote;
  const decimals =
    q === "JPY" || q === "KRW" || q === "VND" ? 3 : 5;
  return d.rate.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const PairRow = memo(function PairRow({
  pair,
  selected,
  onPick,
  quote,
}: {
  pair: string;
  selected: boolean;
  onPick: (pair: string) => void;
  quote?: ForexDaily | null | "pending";
}) {
  const parts = splitPairCurrencies(pair);
  const showFlags =
    parts &&
    currencyToFlagCountryCode(parts.base) &&
    currencyToFlagCountryCode(parts.quote);

  const pending = quote === "pending" || quote === undefined;
  const daily = quote && quote !== "pending" ? quote : null;

  return (
    <button
      type="button"
      onClick={() => onPick(pair)}
      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors motion-reduce:transition-none ${
        selected ? "bg-primary/8 ring-1 ring-primary/25" : "hover:bg-elevated"
      }`}
    >
      <div className="flex h-8 w-11 shrink-0 items-center justify-center scale-90">
        {showFlags ? (
          <PairFlagCluster pair={pair} />
        ) : (
          <span className="flex h-8 min-w-[2.75rem] items-center justify-center rounded-full border border-border bg-elevated px-2 text-[10px] font-semibold tabular-nums text-text-secondary">
            {pair}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{formatPairSlash(pair)}</p>
        <p className="text-xs text-text-tertiary">Spot FX</p>
      </div>
      <div className="flex min-w-[7.25rem] shrink-0 flex-col items-end justify-center gap-0.5 text-right">
        {pending ? (
          <>
            <span className="h-3.5 w-16 animate-pulse rounded bg-border motion-reduce:animate-none" />
            <span className="h-3 w-12 animate-pulse rounded bg-border motion-reduce:animate-none" />
          </>
        ) : daily ? (
          <>
            <span className="font-mono text-xs font-medium tabular-nums text-text-primary">
              {formatSpotRate(daily)}
            </span>
            <span
              className={`text-[11px] font-medium tabular-nums ${
                daily.changePct > 0
                  ? "text-emerald-600"
                  : daily.changePct < 0
                    ? "text-red-600"
                    : "text-text-secondary"
              }`}
            >
              {daily.changePct >= 0 ? "+" : ""}
              {daily.changePct.toFixed(2)}% day
            </span>
          </>
        ) : (
          <>
            <span className="text-xs tabular-nums text-text-tertiary">—</span>
            <span className="text-[11px] text-text-tertiary">—</span>
          </>
        )}
      </div>
    </button>
  );
});
