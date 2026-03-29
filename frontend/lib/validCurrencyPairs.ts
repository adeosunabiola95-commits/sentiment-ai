import { getSupportedCurrencyCodes } from "./currencyFlags";

const SUPPORTED = new Set(getSupportedCurrencyCodes());

/**
 * True when `normalized` is exactly 6 letters, base ≠ quote, and both legs are
 * known ISO 4217 (or metal) codes we support.
 */
export function isValidCurrencyPair(normalized: string): boolean {
  if (normalized.length !== 6) return false;
  const base = normalized.slice(0, 3);
  const quote = normalized.slice(3, 6);
  if (base === quote) return false;
  return SUPPORTED.has(base) && SUPPORTED.has(quote);
}
