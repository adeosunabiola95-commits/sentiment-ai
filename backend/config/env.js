/**
 * Central place for server-side env reads (secrets stay on the backend only).
 * See docs/API-ARCHITECTURE.md for how this maps to external APIs.
 */

function splitOrigins(raw) {
  if (!raw || typeof raw !== "string") return null;
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

export function getServerConfig() {
  return {
    port: Number(process.env.PORT) || 4000,
    openaiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
    newsApiKey: process.env.NEWSAPI_KEY?.trim() ?? "",
    openaiModel: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    corsOrigins: splitOrigins(process.env.CORS_ORIGIN),
  };
}
