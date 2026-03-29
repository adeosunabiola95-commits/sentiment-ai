import type { AnalysisResult } from "./types";

const base =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "http://localhost:4000";

function apiUnreachableMessage(apiBase: string) {
  return `Could not reach the API at ${apiBase}. From the project root run "npm run dev" (starts the app and API together), or in a second terminal run "npm run dev:api". Check NEXT_PUBLIC_API_URL in frontend/.env.local if you use a custom API URL.`;
}

export async function analyzePair(pair: string): Promise<AnalysisResult> {
  let res: Response;
  try {
    res = await fetch(`${base}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pair }),
    });
  } catch {
    throw new Error(apiUnreachableMessage(base));
  }

  const data = (await res.json()) as AnalysisResult & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }

  return data as AnalysisResult;
}

/** Normalized wire story for UI (NewsAPI or demo feed). */
export type NewsArticle = {
  title: string;
  description?: string | null;
  sourceName?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  /** When provided by the wire (e.g. NewsAPI). */
  author?: string | null;
};

export type NewsHeadlinesResponse = {
  pair: string;
  headlines: string[];
  articles: NewsArticle[];
  source: "newsapi" | "mock";
};

/** Headlines for the pair (NewsAPI when NEWSAPI_KEY is set on the server, else sample lines). */
export async function fetchNewsHeadlines(
  pair: string
): Promise<NewsHeadlinesResponse> {
  const q = encodeURIComponent(pair.trim().toUpperCase());
  let res: Response;
  try {
    res = await fetch(`${base}/news?pair=${q}`);
  } catch {
    throw new Error(apiUnreachableMessage(base));
  }
  const data = (await res.json()) as NewsHeadlinesResponse & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `News request failed (${res.status})`);
  }
  const out = data as NewsHeadlinesResponse;
  if (!Array.isArray(out.articles)) {
    return { ...out, articles: [] };
  }
  return out;
}

export type ForexLatest = {
  pair: string;
  rate: number;
  time: number;
};

/** Latest mid rate (backend proxies exchangerate.host; avoids CORS). */
export type ForexDaily = {
  pair: string;
  base: string;
  quote: string;
  rate: number;
  previousRate: number;
  changePct: number;
  time: number;
};

/** Latest mid plus prior-day rate for daily % change. */
export async function fetchForexDaily(pair: string): Promise<ForexDaily> {
  const q = encodeURIComponent(pair.trim().toUpperCase());
  let res: Response;
  try {
    res = await fetch(`${base}/forex/daily?pair=${q}`);
  } catch {
    throw new Error(apiUnreachableMessage(base));
  }
  const data = (await res.json()) as ForexDaily & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `Forex daily failed (${res.status})`);
  }
  return data as ForexDaily;
}

export async function fetchForexLatest(pair: string): Promise<ForexLatest> {
  const q = encodeURIComponent(pair.trim().toUpperCase());
  let res: Response;
  try {
    res = await fetch(`${base}/forex/latest?pair=${q}`);
  } catch {
    throw new Error(apiUnreachableMessage(base));
  }
  const data = (await res.json()) as ForexLatest & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `Forex request failed (${res.status})`);
  }
  return data as ForexLatest;
}
