import OpenAI from "openai";
import { buildAnalysisContext } from "./contextBuilder.js";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

function buildUserPrompt(pair, ctx) {
  const newsBlock = ctx.headlines.map((h) => `- ${h}`).join("\n");
  const marketBlock = ctx.marketLines.map((m) => `- ${m}`).join("\n");

  const provenance = `Data sources for this run — news: ${ctx.sources.news}, rates: ${ctx.sources.rates}. Treat headlines as third-party summaries; verify before trading.`;

  return `You are a forex market sentiment analyst.

Analyze the forex pair: ${pair}

${provenance}

Data:
News Headlines:
${newsBlock}

Market Context:
${marketBlock}

Return ONLY valid JSON in this format:
{
  "sentiment": "Bullish | Bearish | Neutral",
  "confidence": number,
  "drivers": ["..."],
  "market_context": "...",
  "risk_factors": ["..."],
  "summary": "..."
}

Do not include explanations outside JSON.`;
}

const SYSTEM =
  "You respond with only a single JSON object matching the user schema. sentiment must be exactly one of: Bullish, Bearish, Neutral. confidence is an integer 0-100. drivers must have 3 to 5 short strings.";

function normalizeAnalysis(obj) {
  if (!obj || typeof obj !== "object") return null;

  const raw = String(obj.sentiment ?? "").trim();
  const lower = raw.toLowerCase();
  const map = { bullish: "Bullish", bearish: "Bearish", neutral: "Neutral" };
  const sentiment =
    map[lower] ||
    (["Bullish", "Bearish", "Neutral"].includes(raw) ? raw : null);

  let confidence = Number(obj.confidence);
  if (Number.isNaN(confidence)) confidence = null;
  else confidence = Math.max(0, Math.min(100, Math.round(confidence)));

  let drivers = Array.isArray(obj.drivers)
    ? obj.drivers.map((d) => String(d).trim()).filter(Boolean)
    : [];
  const pad = "Macro and positioning factors may shift intraday.";
  while (drivers.length < 3) drivers.push(pad);
  drivers = drivers.slice(0, 5);

  let market_context =
    typeof obj.market_context === "string" ? obj.market_context.trim() : "";
  if (!market_context) {
    market_context =
      "Mixed signals from policy expectations and risk appetite; watch upcoming catalysts.";
  }

  let risk_factors = Array.isArray(obj.risk_factors)
    ? obj.risk_factors.map((r) => String(r).trim()).filter(Boolean)
    : [];
  if (risk_factors.length === 0) {
    risk_factors = [
      "Sudden shifts in rates or risk sentiment can invalidate short-term bias.",
    ];
  }

  let summary = typeof obj.summary === "string" ? obj.summary.trim() : "";
  if (!summary) {
    summary =
      "Overall sentiment reflects the supplied headlines and market context; reassess as new data arrives.";
  }

  if (!sentiment || confidence === null) return null;

  return {
    sentiment,
    confidence,
    drivers,
    market_context,
    risk_factors,
    summary,
  };
}

function validateAnalysis(obj) {
  if (!obj || typeof obj !== "object") return "Invalid response shape";
  const { sentiment, confidence, drivers, market_context, risk_factors, summary } =
    obj;
  const okSentiment = ["Bullish", "Bearish", "Neutral"].includes(sentiment);
  if (!okSentiment) return "Invalid sentiment";
  if (typeof confidence !== "number" || confidence < 0 || confidence > 100)
    return "Invalid confidence";
  if (!Array.isArray(drivers) || drivers.length < 3 || drivers.length > 5)
    return "drivers must have 3-5 items";
  if (typeof market_context !== "string") return "Invalid market_context";
  if (!Array.isArray(risk_factors)) return "Invalid risk_factors";
  if (typeof summary !== "string") return "Invalid summary";
  return null;
}

export async function analyzePair(pair) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.statusCode = 503;
    throw err;
  }

  const ctx = await buildAnalysisContext(pair);
  const client = new OpenAI({ apiKey });

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(pair, ctx) },
      ],
    });
  } catch (e) {
    const msg =
      e?.message ||
      e?.error?.message ||
      "OpenAI request failed. Check your API key and model access.";
    const err = new Error(msg);
    err.statusCode = 502;
    throw err;
  }

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    const err = new Error("Empty response from OpenAI");
    err.statusCode = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const err = new Error("Failed to parse JSON from OpenAI");
    err.statusCode = 502;
    throw err;
  }

  const normalized = normalizeAnalysis(parsed);
  if (!normalized) {
    const validationError = validateAnalysis(parsed);
    const err = new Error(
      validationError || "Could not normalize model output"
    );
    err.statusCode = 502;
    throw err;
  }

  const validationError = validateAnalysis(normalized);
  if (validationError) {
    const err = new Error(validationError);
    err.statusCode = 502;
    throw err;
  }

  return {
    pair,
    sentiment: normalized.sentiment,
    confidence: normalized.confidence,
    drivers: normalized.drivers,
    market_context: normalized.market_context,
    risk_factors: normalized.risk_factors,
    summary: normalized.summary,
    sources: ctx.sources,
    mock: {
      headlines: ctx.headlines,
      trend: ctx.trend,
      volatility: ctx.volatility,
    },
  };
}
