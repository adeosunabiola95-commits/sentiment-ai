/**
 * ECB reference rates via Frankfurter (no API key).
 * Used for analysis market context and can back forex routes.
 */

export async function fetchFrankfurterSnapshot(pair) {
  if (typeof pair !== "string" || pair.length !== 6) {
    return { ok: false, reason: "invalid_pair" };
  }
  const base = pair.slice(0, 3);
  const quote = pair.slice(3, 6);

  const y = new Date();
  y.setUTCDate(y.getUTCDate() - 1);
  const yesterdayStr = y.toISOString().slice(0, 10);

  try {
    const [latestRes, histRes] = await Promise.all([
      fetch(`https://api.frankfurter.app/latest?from=${base}&to=${quote}`),
      fetch(`https://api.frankfurter.app/${yesterdayStr}?from=${base}&to=${quote}`),
    ]);

    if (!latestRes.ok) {
      return { ok: false, reason: `latest_${latestRes.status}` };
    }

    const latest = await latestRes.json();
    const rate = latest.rates?.[quote];
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      return { ok: false, reason: "no_rate" };
    }

    let previousRate = rate;
    if (histRes.ok) {
      const hist = await histRes.json();
      const p = hist.rates?.[quote];
      if (typeof p === "number" && Number.isFinite(p)) previousRate = p;
    }

    const changePct =
      previousRate !== 0
        ? ((rate - previousRate) / previousRate) * 100
        : 0;

    return {
      ok: true,
      rate,
      previousRate,
      changePct,
      base,
      quote,
      rateDate: latest.date ?? null,
    };
  } catch (e) {
    return { ok: false, reason: e?.message || "fetch_error" };
  }
}
