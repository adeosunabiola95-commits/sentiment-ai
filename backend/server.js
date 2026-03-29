import "dotenv/config";
import express from "express";
import cors from "cors";
import { getServerConfig } from "./config/env.js";
import analyzeRouter from "./routes/analyze.js";
import forexRouter from "./routes/forex.js";
import newsRouter from "./routes/news.js";

const app = express();
const config = getServerConfig();
const PORT = config.port;

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const allowedOrigins = config.corsOrigins ?? defaultOrigins;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(analyzeRouter);
app.use(forexRouter);
app.use(newsRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  // Only hide details for unknown 500s; 502/503 carry actionable messages (API key, OpenAI, validation).
  const message =
    status === 500
      ? "Analysis failed. Try again later."
      : err.message || "Request failed";
  console.error(err);
  res.status(status).json({
    error: status === 500 ? "Server error" : "Request error",
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Sentiment.ai API listening on http://localhost:${PORT}`);
});
