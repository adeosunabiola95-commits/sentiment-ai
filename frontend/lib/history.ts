import type { HistoryEntry } from "./types";

const KEY = "forex-sentiment-history-v1";
const MAX = 10;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const prev = loadHistory();
  const next = [
    entry,
    ...prev.filter(
      (e) => !(e.pair === entry.pair && e.at === entry.at)
    ),
  ].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
