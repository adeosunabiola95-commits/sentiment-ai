/**
 * ISO 4217 currency → ISO 3166-1 alpha-2 (or EU) for flagcdn.com paths.
 * @see https://flagcdn.com
 */
const CURRENCY_TO_FLAG: Record<string, string> = {
  AED: "ae",
  AFN: "af",
  ALL: "al",
  AMD: "am",
  ARS: "ar",
  AUD: "au",
  AZN: "az",
  BDT: "bd",
  BGN: "bg",
  BHD: "bh",
  BRL: "br",
  BYN: "by",
  CAD: "ca",
  CHF: "ch",
  CLP: "cl",
  CNY: "cn",
  CNH: "cn",
  COP: "co",
  CRC: "cr",
  CZK: "cz",
  DKK: "dk",
  DZD: "dz",
  EGP: "eg",
  ETB: "et",
  EUR: "eu",
  GBP: "gb",
  GHS: "gh",
  GEL: "ge",
  HKD: "hk",
  HRK: "hr",
  HUF: "hu",
  IDR: "id",
  ILS: "il",
  INR: "in",
  IQD: "iq",
  IRR: "ir",
  ISK: "is",
  JOD: "jo",
  JPY: "jp",
  KES: "ke",
  KRW: "kr",
  KWD: "kw",
  KZT: "kz",
  LKR: "lk",
  MAD: "ma",
  MDL: "md",
  MXN: "mx",
  MYR: "my",
  NGN: "ng",
  NOK: "no",
  NPR: "np",
  NZD: "nz",
  OMR: "om",
  PEN: "pe",
  PHP: "ph",
  PKR: "pk",
  PLN: "pl",
  PYG: "py",
  QAR: "qa",
  RON: "ro",
  RSD: "rs",
  RUB: "ru",
  SAR: "sa",
  SEK: "se",
  SGD: "sg",
  THB: "th",
  TND: "tn",
  TRY: "tr",
  TWD: "tw",
  TZS: "tz",
  UAH: "ua",
  UGX: "ug",
  USD: "us",
  UYU: "uy",
  UZS: "uz",
  VND: "vn",
  ZAR: "za",
  ZMW: "zm",
};

/** ISO 4217 codes we support for FX pairs, plus metals (XAU, …). */
export function getSupportedCurrencyCodes(): readonly string[] {
  return [...Object.keys(CURRENCY_TO_FLAG), "XAU", "XAG", "XPT", "XPD"];
}

/** Strip separators so "USD/JPY" and "USD JPY" still resolve. */
export function normalizePairLetters(pair: string): string {
  return pair.replace(/[^a-zA-Z]/g, "").toUpperCase();
}

/** Lowercase alpha-2 / `eu` for flagcdn, or null if unknown. */
export function currencyToFlagCountryCode(currency: string): string | null {
  const code = currency.trim().toUpperCase();
  const flag = CURRENCY_TO_FLAG[code];
  return flag ?? null;
}

/** English country / region label for a flagcdn code (e.g. `us` → United States). */
export function flagCodeToCountryName(flagCode: string): string {
  const region = flagCode.trim().toUpperCase();
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const n = dn.of(region);
    if (n) return n;
  } catch {
    /* invalid region code */
  }
  return region;
}

/** Country (or region) name for tooltip on a currency’s flag, or null if no flag mapping. */
export function currencyToCountryName(currency: string): string | null {
  const fc = currencyToFlagCountryCode(currency);
  if (!fc) return null;
  return flagCodeToCountryName(fc);
}

/** Base (first 3) and quote (last 3) ISO codes from a 6-letter pair. */
export function splitPairCurrencies(pair: string): {
  base: string;
  quote: string;
} | null {
  const letters = normalizePairLetters(pair);
  if (letters.length !== 6) return null;
  return { base: letters.slice(0, 3), quote: letters.slice(3, 6) };
}
