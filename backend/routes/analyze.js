import { Router } from "express";
import { analyzePair } from "../services/openai.js";
import { isValidCurrencyPair } from "../services/validCurrencyPairs.js";

const router = Router();

function normalizePair(raw) {
  if (typeof raw !== "string") return null;
  const s = raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length !== 6) return null;
  return s;
}

router.post("/analyze", async (req, res, next) => {
  try {
    const pair = normalizePair(req.body?.pair);
    if (!pair) {
      return res.status(400).json({
        error: "Invalid request",
        message: 'Body must include "pair" as exactly six letters, e.g. "USDJPY" or "EURUSD".',
      });
    }
    if (!isValidCurrencyPair(pair)) {
      return res.status(400).json({
        error: "Invalid pair",
        message:
          "Unknown currency pair. Use two supported ISO 4217 codes (e.g. EURUSD, USDJPY).",
      });
    }

    const result = await analyzePair(pair);
    return res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
