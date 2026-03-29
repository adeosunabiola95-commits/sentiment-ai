/**
 * Builds real (when available) + deterministic fallback context for LLM analysis.
 */

import { getMockContext } from "./mockData.js";
import { fetchFrankfurterSnapshot } from "./frankfurterSnapshot.js";
import { fetchNewsApiHeadlines } from "./newsNewsApi.js";

function decimalsForQuote(quote) {
  return quote === "JPY" || quote === "KRW" || quote === "VND" ? 3 : 5;
}

/**
 * @returns {Promise<{
 *   headlines: string[],
 *   marketLines: string[],
 *   trend: string,
 *   volatility: string,
 *   sources: { news: string, rates: string }
 * }>}
 */
export async function buildAnalysisContext(pair) {
  const mock = getMockContext(pair);

  const [newsResult, ratesResult] = await Promise.all([
    fetchNewsApiHeadlines(pair),
    fetchFrankfurterSnapshot(pair),
  ]);

  let headlines = mock.headlines;
  let newsSource = "mock";

  if (newsResult?.ok && Array.isArray(newsResult.headlines)) {
    headlines = newsResult.headlines;
    newsSource = "newsapi";
  }

  let marketLines = mock.marketLines;
  let trend = mock.trend;
  let volatility = mock.volatility;
  let ratesSource = "mock";

  if (ratesResult?.ok) {
    ratesSource = "frankfurter";
    const { rate, changePct, quote } = ratesResult;
    const dec = decimalsForQuote(quote);
    const ch = changePct;
    marketLines = [
      `${ratesResult.base}/${ratesResult.quote} ECB reference spot: ${rate.toFixed(dec)} (Frankfurter, date ${ratesResult.rateDate ?? "n/a"})`,
      `Session-to-session change vs prior business day: ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}% (approximate; pair may be illiquid on some crosses).`,
    ];
    if (ch > 0.12) trend = "uptrend";
    else if (ch < -0.12) trend = "downtrend";
    else trend = "sideways";

    const mag = Math.abs(ch);
    if (mag < 0.08) volatility = "low";
    else if (mag < 0.35) volatility = "moderate";
    else volatility = "elevated";
  }

  return {
    headlines,
    marketLines,
    trend,
    volatility,
    sources: { news: newsSource, rates: ratesSource },
  };
}
