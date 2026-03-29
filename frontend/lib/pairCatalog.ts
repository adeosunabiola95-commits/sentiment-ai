import { getSupportedCurrencyCodes } from "./currencyFlags";

/** G10-style liquid majors + precious metals quoted like majors in the picker. */
const MAJOR_LEGS = new Set([
  "USD",
  "EUR",
  "JPY",
  "GBP",
  "CHF",
  "AUD",
  "NZD",
  "CAD",
  "XAU",
  "XAG",
  "XPT",
  "XPD",
]);

/** Max rows rendered / priced per view when the filtered set is huge (full matrix is 6k+ pairs). */
export const PAIR_LIST_DISPLAY_CAP = 500;

/** Preset pairs (shown as “Popular”). */
export const PRESET_PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "EURJPY",
] as const;

export type PairCategoryId =
  | "all"
  | "majors"
  | "usd"
  | "crosses"
  | "exotics";

export const PAIR_CATEGORY_TABS: { id: PairCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "majors", label: "Majors" },
  { id: "usd", label: "USD" },
  { id: "crosses", label: "Crosses" },
  { id: "exotics", label: "Exotics" },
];

function buildAllPairsFromSupported(): string[] {
  const codes = [...getSupportedCurrencyCodes()];
  const out: string[] = [];
  for (const base of codes) {
    for (const quote of codes) {
      if (base === quote) continue;
      out.push(base + quote);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

/**
 * Every valid base/quote combination from supported ISO codes + metals (XAU, …).
 * ~80+ currencies → thousands of crosses and exotics.
 */
export const CATALOG_PAIRS: string[] = buildAllPairsFromSupported();

function isMajorPair(pair: string): boolean {
  if (pair.length !== 6) return false;
  const b = pair.slice(0, 3);
  const q = pair.slice(3, 6);
  return MAJOR_LEGS.has(b) && MAJOR_LEGS.has(q);
}

export function pairMatchesCategory(pair: string, cat: PairCategoryId): boolean {
  if (pair.length !== 6) return false;
  if (cat === "all") return true;
  if (cat === "majors") return isMajorPair(pair);
  if (cat === "usd") return pair.includes("USD");
  if (cat === "crosses") return !pair.includes("USD");
  if (cat === "exotics") return !isMajorPair(pair);
  return true;
}

/**
 * Precomputed pools (one pass over the catalog) so search only scans the active tab,
 * not 6k+ pairs every time.
 */
function buildPairsByCategory(): Record<PairCategoryId, readonly string[]> {
  const all = CATALOG_PAIRS;
  const majors: string[] = [];
  const usd: string[] = [];
  const crosses: string[] = [];
  const exotics: string[] = [];
  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    if (isMajorPair(p)) majors.push(p);
    if (p.includes("USD")) usd.push(p);
    if (!p.includes("USD")) crosses.push(p);
    if (!isMajorPair(p)) exotics.push(p);
  }
  return {
    all,
    majors,
    usd,
    crosses,
    exotics,
  };
}

export const PAIRS_BY_CATEGORY: Record<PairCategoryId, readonly string[]> =
  buildPairsByCategory();

export function normalizePairSearchQuery(query: string): string {
  return query.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

/**
 * Filter pairs in the active category whose 6-letter code contains the search string.
 * Scans only {@link PAIRS_BY_CATEGORY}[category] (not the full matrix when a tab is selected).
 */
export function filterPairCatalog(
  query: string,
  category: PairCategoryId
): string[] {
  const q = normalizePairSearchQuery(query);
  const pool = PAIRS_BY_CATEGORY[category];

  if (!q.length) {
    return [...pool];
  }

  if (q.length === 6) {
    for (let i = 0; i < pool.length; i++) {
      if (pool[i] === q) return [pool[i]];
    }
    return [];
  }

  const out: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (p.includes(q)) out.push(p);
  }
  return out;
}

export function formatPairSlash(pair: string): string {
  if (pair.length !== 6) return pair;
  return `${pair.slice(0, 3)} / ${pair.slice(3, 6)}`;
}
