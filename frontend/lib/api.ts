import type { AnalysisResult } from "./types";

const base =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "http://localhost:4000";

function apiUnreachableMessage(apiBase: string) {
  const isLocalDefault = apiBase === "http://localhost:4000";
  if (isLocalDefault) {
    return `API URL is not set. On Vercel: Project → Settings → Environment Variables → add NEXT_PUBLIC_API_URL = your Railway API URL (https://…, no trailing slash), then Redeploy. Locally: set it in frontend/.env.local and restart the dev server.`;
  }
  return `Could not reach the API at ${apiBase}. Check the URL, CORS, and that the Railway service is running.`;
}

/** Avoid opaque JSON.parse errors when the server returns HTML (404 page, wrong URL). */
async function readJsonResponse(res: Response, context: string): Promise<unknown> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(
      `Empty response (${context}, HTTP ${res.status}). Set NEXT_PUBLIC_API_URL on Vercel to your Railway API base URL and redeploy.`
    );
  }
  const first = trimmed[0];
  if (first !== "{" && first !== "[") {
    throw new Error(
      `API returned non-JSON (${context}, HTTP ${res.status}). First character is "${first}" — often HTML from a wrong URL. In Vercel → Settings → Environment Variables set NEXT_PUBLIC_API_URL=https://your-app.up.railway.app (no trailing slash), then Redeploy.`
    );
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Invalid JSON from API (${context}). Check NEXT_PUBLIC_API_URL and redeploy the frontend.`);
  }
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

  const data = (await readJsonResponse(res, "POST /analyze")) as AnalysisResult & {
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
  const data = (await readJsonResponse(res, "GET /news")) as NewsHeadlinesResponse & {
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
  const data = (await readJsonResponse(res, "GET /forex/daily")) as ForexDaily & {
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
  const data = (await readJsonResponse(res, "GET /forex/latest")) as ForexLatest & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || data.error || `Forex request failed (${res.status})`);
  }
  return data as ForexLatest;
}
