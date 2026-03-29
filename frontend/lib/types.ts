export type Sentiment = "Bullish" | "Bearish" | "Neutral";

export type DataSources = {
  /** Headlines: NewsAPI when key set, else bundled sample lines */
  news: "newsapi" | "mock";
  /** FX context: Frankfurter ECB reference when pair supported, else sample */
  rates: "frankfurter" | "mock";
};

export type AnalysisResult = {
  pair: string;
  sentiment: Sentiment;
  confidence: number;
  drivers: string[];
  market_context: string;
  risk_factors: string[];
  summary: string;
  /** Which feeds were used for this analysis run */
  sources?: DataSources;
  mock?: {
    headlines: string[];
    trend: string;
    volatility: string;
  };
};

export type HistoryEntry = {
  pair: string;
  sentiment: Sentiment;
  summary: string;
  at: string;
};
