/**
 * NewsAPI.org — keyword search over global articles (free tier: 100 req/day on dev plan).
 * Set NEWSAPI_KEY in .env. If unset or request fails, analysis falls back to mock headlines.
 *
 * Uses description + content when available — content often carries more body text
 * (may end with "[+N chars]" on the developer plan; we strip that marker).
 *
 * https://newsapi.org/docs/endpoints/everything
 */

const MAX_BODY_CHARS = 2200;
const PAGE_SIZE = 50;
const MAX_ARTICLES = 20;

function buildQuery(pair) {
  const base = pair.slice(0, 3);
  const quote = pair.slice(3, 6);
  return `"${base}/${quote}" OR "${base} ${quote}" OR (${base} ${quote} forex) OR (${base} ${quote} currency)`;
}

/** NewsAPI appends a truncation hint like "[+593 chars]" on some plans. */
function stripTruncationMarker(text) {
  return String(text)
    .replace(/\[\+\d+\s*chars\]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateBody(text, max = MAX_BODY_CHARS) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.65 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * Prefer the longest useful body: often `content` repeats the lede from `description`
 * but adds more paragraphs; otherwise merge without heavy duplication.
 */
function buildRichBody(description, content) {
  const desc = description != null ? stripTruncationMarker(String(description)) : "";
  const cont = content != null ? stripTruncationMarker(String(content)) : "";

  if (!desc && !cont) return null;
  if (!cont) return truncateBody(desc);
  if (!desc) return truncateBody(cont);

  const dLow = desc.toLowerCase();
  const cLow = cont.toLowerCase();

  if (cLow.length >= desc.length && cLow.startsWith(dLow.slice(0, Math.min(48, dLow.length)))) {
    return truncateBody(cont);
  }

  if (cLow.includes(dLow.slice(0, Math.min(60, dLow.length)))) {
    return truncateBody(cont);
  }

  if (dLow.includes(cLow.slice(0, Math.min(40, cLow.length)))) {
    return truncateBody(desc);
  }

  const merged = `${desc} ${cont}`;
  return truncateBody(merged);
}

export async function fetchNewsApiHeadlines(pair) {
  const apiKey = process.env.NEWSAPI_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "no_api_key" };
  }

  if (typeof pair !== "string" || pair.length !== 6) {
    return { ok: false, reason: "invalid_pair" };
  }

  const q = encodeURIComponent(buildQuery(pair));
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=${PAGE_SIZE}&apiKey=${apiKey}`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return { ok: false, reason: `http_${r.status}` };
    }
    const data = await r.json();
    if (data.status !== "ok" || !Array.isArray(data.articles)) {
      return { ok: false, reason: data.message || "bad_payload" };
    }

    const raw = data.articles
      .filter((a) => a?.title && String(a.title).length > 8)
      .slice(0, MAX_ARTICLES);

    const articles = raw.map((a) => {
      const title = String(a.title).trim();
      const description = buildRichBody(a.description, a.content);
      const author =
        a.author && String(a.author).trim().length > 1
          ? String(a.author).trim()
          : null;

      return {
        title,
        description,
        sourceName: a.source?.name ? String(a.source.name).trim() : null,
        url: a.url ? String(a.url).trim() : null,
        publishedAt: a.publishedAt ? String(a.publishedAt) : null,
        author,
      };
    });

    const headlines = articles.map((a) => {
      const src = a.sourceName ? ` — ${a.sourceName}` : "";
      return `${a.title}${src}`;
    });

    if (headlines.length < 2) {
      return { ok: false, reason: "too_few_articles" };
    }

    return { ok: true, headlines, articles };
  } catch (e) {
    return { ok: false, reason: e?.message || "fetch_error" };
  }
}
