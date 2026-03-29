# Sentiment.ai (MVP)

AI-powered forex pair sentiment analysis: **optional live news** (NewsAPI) + **ECB reference rates** (Frankfurter) fed into OpenAI, with deterministic fallbacks when APIs are unavailable. Next.js + Tailwind UI aligned with [`designsystem_baseline.md`](./designsystem_baseline.md).

## Prerequisites

- **Node.js** 18+
- **OpenAI API key** with access to chat completions (e.g. `gpt-4o-mini`)

## Run app + API together (recommended)

From the **repository root** after completing [Setup](#setup) below (both `backend/` and `frontend/` have `node_modules` and env files):

```bash
npm install
npm run dev
```

This starts **Next.js** (default port 3000) and the **Express API** (port 4000) in one terminal. Use `npm run dev:web` or `npm run dev:api` only if you need a single process.

## Project layout

```text
backend/     Express API — POST /analyze
frontend/    Next.js (App Router) + Tailwind CSS
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:

```env
OPENAI_API_KEY=sk-...
PORT=4000
```

Optional:

```env
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
# Richer headlines for /analyze (free tier: https://newsapi.org/register)
NEWSAPI_KEY=
```

Without `NEWSAPI_KEY`, analysis uses bundled sample headlines. Rates use **Frankfurter** (no key) when the pair is supported; otherwise market lines fall back to samples.

Start the API:

```bash
npm run dev
```

Server listens on `http://localhost:4000`. Health check: `GET http://localhost:4000/health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Default `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Usage

1. Enter a pair (e.g. **USDJPY**) or use **Quick select**.
2. Click **Analyze**.
3. Review sentiment, confidence, drivers, market context, risks, and summary. Recent runs are stored in **localStorage** (last 10).

## API

### `POST /analyze`

**Request**

```json
{
  "pair": "USDJPY"
}
```

**Success (200)** — example shape:

```json
{
  "pair": "USDJPY",
  "sentiment": "Bullish",
  "confidence": 72,
  "drivers": [
    "Monetary policy divergence between BoJ and Fed",
    "Persistent US inflation supports dollar strength narrative",
    "Moderate volatility offers tactical opportunities"
  ],
  "market_context": "The pair shows directional bias consistent with the mock trend and headline mix; positioning may be sensitive to the next central-bank communications.",
  "risk_factors": [
    "Sudden shift in Fed guidance",
    "Unexpected BoJ policy adjustment",
    "Liquidity gaps around major data releases"
  ],
  "summary": "Overall sentiment skews bullish for USDJPY in this mock setup, with confidence moderated by policy and inflation uncertainty.",
  "sources": {
    "news": "newsapi",
    "rates": "frankfurter"
  },
  "mock": {
    "headlines": [
      "Bank of Japan maintains ultra-loose monetary policy",
      "US inflation remains persistent",
      "Federal Reserve signals possible rate hike"
    ],
    "trend": "uptrend",
    "volatility": "moderate"
  }
}
```

**Errors**

- `400` — invalid or missing `pair`
- `503` — `OPENAI_API_KEY` not configured
- `500` / `502` — OpenAI or JSON validation failure (see JSON `message` where applicable)

## Chart (Liveline)

The dashboard chart uses **[Liveline](https://benji.org/liveline#getting-started)** (`npm install liveline`): a canvas-based animated line with smooth interpolation. It expects `data` as `{ time, value }[]` and a live `value` (see the [Getting started](https://benji.org/liveline#getting-started) section on the same page).

**Plugging in a live forex feed**

1. Subscribe to your provider (websocket or REST poll): e.g. OANDA, Polygon, Twelve Data, or your broker’s API.
2. Map each tick to `LivelinePoint`: `time` = Unix ms, `value` = mid price (or normalized % change if you prefer).
3. In `frontend/components/SentimentChart.tsx`, replace the `setInterval` simulation with updates from your feed: push new points, update `value`/`sentValue` (and optionally add a **second series** for price vs. sentiment, or use Liveline’s `referenceLine` / multi-series patterns from the docs).
4. **Align timeframes** with the `windows` / `window` props so the visible window matches your data (1h / 6h / 24h).

Until you wire a feed, the app keeps **simulated** live ticks so the line still moves.

## Design

UI tokens (primary indigo, light surfaces, semantic green/red for sentiment) follow [`designsystem_baseline.md`](./designsystem_baseline.md).

## License

Private / use as needed for your project.
