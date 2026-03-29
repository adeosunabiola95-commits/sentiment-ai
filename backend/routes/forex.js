import { Router } from "express";
import { fetchFrankfurterSnapshot } from "../services/frankfurterSnapshot.js";

const router = Router();

function normalizePair(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length !== 6) return null;
  return s;
}

/**
 * Latest FX mid. Proxied so the browser is not blocked by CORS.
 * Rates: Frankfurter (ECB reference).
 */
router.get("/forex/latest", async (req, res, next) => {
  try {
    const pair = normalizePair(String(req.query.pair || ""));
    if (!pair) {
      return res.status(400).json({
        error: "Invalid request",
        message: 'Query "pair" must be a 6-letter code like USDJPY.',
      });
    }
    const snap = await fetchFrankfurterSnapshot(pair);
    if (!snap.ok) {
      return res.status(502).json({
        error: "Bad response",
        message: "Could not read exchange rate (unsupported pair or upstream error).",
      });
    }
    return res.json({
      pair,
      base: snap.base,
      quote: snap.quote,
      rate: snap.rate,
      time: Date.now(),
    });
  } catch (e) {
    return next(e);
  }
});

/** Latest rate plus prior ECB day for daily % change. */
router.get("/forex/daily", async (req, res, next) => {
  try {
    const pair = normalizePair(String(req.query.pair || ""));
    if (!pair) {
      return res.status(400).json({
        error: "Invalid request",
        message: 'Query "pair" must be a 6-letter code like USDJPY.',
      });
    }
    const snap = await fetchFrankfurterSnapshot(pair);
    if (!snap.ok) {
      return res.status(502).json({
        error: "Bad response",
        message: "Could not read latest exchange rate.",
      });
    }
    return res.json({
      pair,
      base: snap.base,
      quote: snap.quote,
      rate: snap.rate,
      previousRate: snap.previousRate,
      changePct: snap.changePct,
      time: Date.now(),
    });
  } catch (e) {
    return next(e);
  }
});

export default router;
