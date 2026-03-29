import { Router } from "express";
import { fetchNewsApiHeadlines } from "../services/newsNewsApi.js";
import { getMockContext } from "../services/mockData.js";

const router = Router();

function normalizePair(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length < 6 || s.length > 10) return null;
  if (!/^[A-Z]{6,10}$/.test(s)) return null;
  return s;
}

/** Headlines only — same logic as analysis context (NewsAPI when NEWSAPI_KEY set). */
router.get("/news", async (req, res) => {
  const pair = normalizePair(req.query?.pair || "");
  if (!pair) {
    return res.status(400).json({
      error: "Invalid request",
      message: 'Query ?pair= is required (e.g. USDJPY).',
    });
  }

  const newsResult = await fetchNewsApiHeadlines(pair);
  const mock = getMockContext(pair);
  let headlines = mock.headlines;
  let source = "mock";

  if (newsResult?.ok && Array.isArray(newsResult.headlines)) {
    headlines = newsResult.headlines;
    source = "newsapi";
  }

  return res.json({ pair, headlines, source });
});

export default router;
