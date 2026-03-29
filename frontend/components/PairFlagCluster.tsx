"use client";

import {
  currencyToCountryName,
  currencyToFlagCountryCode,
  splitPairCurrencies,
} from "@/lib/currencyFlags";

type Props = {
  pair: string;
  /** Base (first 3 letters of pair) in front; quote (last 3) behind */
  className?: string;
};

/**
 * Overlapping circular flags (flagcdn) for a 6-letter forex pair, e.g. USDNGN.
 * Quote sits top-right; base bottom-left with a white ring so the overlap reads clearly.
 * Size is ~80% of the original 32px circles (≈25.6px).
 */
export function PairFlagCluster({ pair, className = "" }: Props) {
  const parts = splitPairCurrencies(pair);
  if (!parts) return null;

  const baseFlag = currencyToFlagCountryCode(parts.base);
  const quoteFlag = currencyToFlagCountryCode(parts.quote);
  if (!baseFlag || !quoteFlag) return null;

  const sz = 26;
  /** flagcdn only serves certain widths; w64/w128 404 — use w40 / w80 (see flagcdn.com). */
  const src1 = `https://flagcdn.com/w40/${quoteFlag}.png`;
  const src2 = `https://flagcdn.com/w40/${baseFlag}.png`;
  const srcSet1 = `${src1} 1x, https://flagcdn.com/w80/${quoteFlag}.png 2x`;
  const srcSet2 = `${src2} 1x, https://flagcdn.com/w80/${baseFlag}.png 2x`;

  const quoteLabel = currencyToCountryName(parts.quote) ?? parts.quote;
  const baseLabel = currencyToCountryName(parts.base) ?? parts.base;

  return (
    <div
      className={`relative h-8 w-[2.2rem] shrink-0 ${className}`}
      role="group"
      aria-label={`${baseLabel} (base), ${quoteLabel} (quote)`}
    >
      <span
        title={quoteLabel}
        className="absolute right-0 top-0 z-[1] block size-[1.6rem] cursor-default rounded-full border border-white shadow-sm"
      >
        <img
          src={src1}
          srcSet={srcSet1}
          width={sz}
          height={sz}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full rounded-full object-cover"
        />
      </span>
      <span
        title={baseLabel}
        className="absolute bottom-0 left-0 z-[2] block size-[1.6rem] cursor-default rounded-full border border-white shadow-sm"
      >
        <img
          src={src2}
          srcSet={srcSet2}
          width={sz}
          height={sz}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full rounded-full object-cover"
        />
      </span>
    </div>
  );
}
