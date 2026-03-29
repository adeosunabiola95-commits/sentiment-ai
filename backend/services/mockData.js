/**
 * Mock news and market context — no external APIs in MVP.
 * Trend varies deterministically by pair for demo variety.
 */

const BASE_HEADLINES = [
  "Bank of Japan maintains ultra-loose monetary policy",
  "US inflation remains persistent",
  "Federal Reserve signals possible rate hike",
  "ECB officials hint at data-dependent next moves",
  "UK labor market shows cooling signs",
  "Global risk sentiment shifts on geopolitical headlines",
];

function hashPair(pair) {
  let h = 0;
  for (let i = 0; i < pair.length; i++) {
    h = (Math.imul(31, h) + pair.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const TRENDS = ["uptrend", "downtrend", "sideways"];
const VOLATILITIES = ["low", "moderate", "elevated"];

export function getMockContext(pair) {
  const h = hashPair(pair);
  const trend = TRENDS[h % TRENDS.length];
  const volatility = VOLATILITIES[(h >> 3) % VOLATILITIES.length];

  const headlines = [
    BASE_HEADLINES[h % BASE_HEADLINES.length],
    BASE_HEADLINES[(h + 2) % BASE_HEADLINES.length],
    BASE_HEADLINES[(h + 4) % BASE_HEADLINES.length],
  ];

  return {
    headlines,
    marketLines: [
      `Pair is in an ${trend}`,
      `Volatility is ${volatility}`,
    ],
    trend,
    volatility,
  };
}
