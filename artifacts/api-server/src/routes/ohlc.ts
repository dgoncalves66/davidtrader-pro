import { Router } from "express";

const router = Router();

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

type Bar = {
  t: number;   // unix timestamp ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  ma20: number | null;
  bbUpper: number | null;
  bbLower: number | null;
};

function calcBB(closes: number[], period = 20): { ma: number | null; upper: number | null; lower: number | null } {
  if (closes.length < period) return { ma: null, upper: null, lower: null };
  const slice = closes.slice(-period);
  const ma = slice.reduce((s, v) => s + v, 0) / period;
  const variance = slice.reduce((s, v) => s + (v - ma) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  return { ma, upper: ma + 2 * std, lower: ma - 2 * std };
}

const INTERVAL_CONFIG: Record<string, { interval: string; range: string }> = {
  "15m": { interval: "15m", range: "5d" },
  "1h": { interval: "1h", range: "1mo" },
  "1d": { interval: "1d", range: "6mo" },
};

router.get("/ohlc", async (req, res) => {
  const symbol = (req.query.symbol as string | undefined)?.toUpperCase();
  const tf = (req.query.interval as string | undefined) ?? "15m";

  if (!symbol) {
    res.status(400).json({ error: "symbol required" });
    return;
  }

  const cfg = INTERVAL_CONFIG[tf];
  if (!cfg) {
    res.status(400).json({ error: `interval must be one of: ${Object.keys(INTERVAL_CONFIG).join(", ")}` });
    return;
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${cfg.interval}&range=${cfg.range}&includePrePost=false`;

  try {
    const resp = await fetch(url, { headers: YF_HEADERS, signal: AbortSignal.timeout(10_000) });
    if (!resp.ok) {
      res.status(502).json({ error: "Yahoo Finance unavailable" });
      return;
    }

    const json = await resp.json() as {
      chart: {
        result?: Array<{
          timestamp?: number[];
          indicators?: {
            quote?: Array<{
              open?: (number | null)[];
              high?: (number | null)[];
              low?: (number | null)[];
              close?: (number | null)[];
              volume?: (number | null)[];
            }>;
          };
        }>;
        error?: { code: string };
      };
    };

    const result = json?.chart?.result?.[0];
    if (!result || !result.timestamp) {
      res.status(404).json({ error: "No data for symbol" });
      return;
    }

    const ts = result.timestamp;
    const q = result.indicators?.quote?.[0];
    if (!q) {
      res.status(404).json({ error: "No quote data" });
      return;
    }

    const bars: Bar[] = [];
    const closesWindow: number[] = [];

    for (let i = 0; i < ts.length; i++) {
      const o = q.open?.[i];
      const h = q.high?.[i];
      const l = q.low?.[i];
      const c = q.close?.[i];
      const v = q.volume?.[i] ?? 0;
      if (o == null || h == null || l == null || c == null) continue;

      closesWindow.push(c);
      const bb = calcBB(closesWindow);

      bars.push({
        t: ts[i] * 1000,
        o, h, l, c,
        v: v ?? 0,
        ma20: bb.ma,
        bbUpper: bb.upper,
        bbLower: bb.lower,
      });
    }

    res.json(bars);
  } catch (err) {
    req.log.error({ err }, "OHLC fetch failed");
    res.status(502).json({ error: "Failed to fetch OHLC data" });
  }
});

export default router;
