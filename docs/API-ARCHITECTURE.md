# API architecture — mock vs live data

This app uses a **backend-for-frontend (BFF)** pattern: the **Next.js** client only talks to your **Express** API (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000`). The browser never holds server secrets; third-party keys stay on the backend.

```
Browser (Next.js)  →  Express (`/analyze`, `/news`, `/forex/*`)  →  external APIs
```

## What is already live (no “mock”)

| Capability | Source | Notes |
|------------|--------|--------|
| **FX rates & daily %** | [Frankfurter](https://www.frankfurter.app/) (ECB reference) | No API key. Used for analysis context, `/forex/latest`, `/forex/daily`, and the pair list in `PairSelectModal`. |
| **LLM sentiment** | OpenAI (`OPENAI_API_KEY`) | Required for real `/analyze` output. Model defaults to `gpt-4o-mini` (`OPENAI_MODEL`). |

## What is optional (falls back to mock)

| Capability | Source | Env | Fallback |
|------------|--------|-----|----------|
| **News headlines** | [NewsAPI](https://newsapi.org/) | `NEWSAPI_KEY` | `backend/services/mockData.js` + `getMockContext()` |

If `NEWSAPI_KEY` is missing or the request fails, `contextBuilder` still runs analysis using **mock headlines** and labels sources as `news: "mock"`.

## What is still synthetic (frontend / chart)

| UI | Current behavior | To make “live” |
|----|------------------|----------------|
| **Sentiment chart (Liveline)** | `frontend/lib/chartSeries.ts` builds a **deterministic** 24h series from the pair + last confidence | Add a backend route that returns time-bucketed sentiment (or scores) from storage or a model pipeline; replace `buildSentimentSeries` inputs with that response. |
| **`mock` block on analysis** | Backend may attach `mock: { headlines, trend, volatility }` for UI/debug | Narrow or remove once all feeds are live; keep `sources` as the source of truth. |

## External APIs summary

1. **OpenAI** — Chat completions for structured sentiment + drivers (see `backend/services/openai.js`).
2. **NewsAPI** — `v2/everything` search for pair-related articles (see `backend/services/newsNewsApi.js`).
3. **Frankfurter** — HTTP GET for latest and historical ECB rates (see `backend/services/frankfurterSnapshot.js`).

Future options (not wired): **Polygon / Twelve Data / Oanda** for intraday series; **Twitter/X or Reddit** for alt sentiment; **your own DB** for history and user accounts.

## Environment variables

**Backend** — copy `backend/.env.example` → `backend/.env`:

- `OPENAI_API_KEY` — required for production-quality analysis.
- `NEWSAPI_KEY` — optional, richer news context.
- `PORT`, `OPENAI_MODEL`, `CORS_ORIGIN` — see `.env.example`.

**Frontend** — copy `frontend/.env.example` → `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL` — base URL of the Express API (same origin in production if you reverse-proxy, or explicit API host).

## Suggested next implementation steps

1. Keep all new integrations **behind Express** (new routes under `backend/routes/`, services under `backend/services/`).
2. Extend `DataSources` in `frontend/lib/types.ts` when you add providers (e.g. `news: "newsapi" | "gnews" | "mock"`).
3. Add caching (Redis or in-memory + TTL) for NewsAPI and Frankfurter if traffic grows.
4. Replace chart seeds with a `GET /sentiment/history?pair=` (or similar) once you define storage.

## Config in code

Shared server config is loaded from `backend/config/env.js` (port, CORS, model). Services can continue to read `process.env` or import that module as you consolidate.
