import { Router } from "express";

const router = Router();

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

export type QuoteResult = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  ma50: number;
  ma200: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
  preMarketPrice: number | null;
  preMarketChange: number | null;
  preMarketChangePct: number | null;
  postMarketPrice: number | null;
  postMarketChange: number | null;
  postMarketChangePct: number | null;
};

type ChartMeta = {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
  currentTradingPeriod?: {
    regular?: { start: number; end: number };
    pre?: { start: number; end: number };
    post?: { start: number; end: number };
  };
};

type ChartResult = {
  meta: ChartMeta;
  timestamp: number[];
  indicators: {
    quote: { close: (number | null)[]; open: (number | null)[] }[];
  };
};

type ChartResponse = {
  chart?: {
    result?: ChartResult[];
    error?: unknown;
  };
};

function findExtendedPrice(
  timestamps: number[],
  closes: (number | null)[],
  fromTs: number,
  toTs: number,
): number | null {
  // find most recent non-null close in [fromTs, toTs]
  for (let i = timestamps.length - 1; i >= 0; i--) {
    const t = timestamps[i];
    if (t >= fromTs && t <= toTs && closes[i] != null) {
      return closes[i] as number;
    }
  }
  return null;
}

async function fetchQuote(symbol: string): Promise<QuoteResult | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d&includePrePost=true`;
  const res = await fetch(url, { headers: YF_HEADERS });
  if (!res.ok) return null;

  const json = await res.json() as ChartResponse;
  const result = json?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const opens = result.indicators?.quote?.[0]?.open ?? [];

  const price = meta.regularMarketPrice;
  if (price == null) return null;

  const prevClose = meta.chartPreviousClose ?? meta.regularMarketPreviousClose ?? price;
  const change = meta.regularMarketChange ?? (price - prevClose);
  const changePct = meta.regularMarketChangePercent ?? ((price - prevClose) / prevClose) * 100;

  // Determine session boundaries
  const regStart = meta.currentTradingPeriod?.regular?.start ?? 0;
  const regEnd   = meta.currentTradingPeriod?.regular?.end   ?? meta.regularMarketTime ?? 0;
  const preStart = meta.currentTradingPeriod?.pre?.start     ?? 0;
  const preEnd   = meta.currentTradingPeriod?.pre?.end       ?? regStart;
  const postStart = meta.currentTradingPeriod?.post?.start   ?? regEnd;
  const postEnd   = meta.currentTradingPeriod?.post?.end     ?? (regEnd + 4 * 3600);

  // Post-market: candles after regular session end
  let postPrice: number | null = null;
  let postChange: number | null = null;
  let postChangePct: number | null = null;
  if (postStart > 0) {
    postPrice = findExtendedPrice(timestamps, closes, postStart, postEnd);
    if (postPrice != null) {
      postChange = postPrice - price;
      postChangePct = (postChange / price) * 100;
    }
  }

  // Pre-market: candles in pre-market window (only show if no post-market or market is not yet open)
  let prePrice: number | null = null;
  let preChange: number | null = null;
  let preChangePct: number | null = null;
  if (preStart > 0 && postPrice == null) {
    prePrice = findExtendedPrice(timestamps, closes, preStart, preEnd);
    if (prePrice != null) {
      preChange = prePrice - prevClose;
      preChangePct = (preChange / prevClose) * 100;
    }
  }

  // Fallback: if trading periods not populated, use regularMarketTime as boundary
  if (!postPrice && !prePrice && meta.regularMarketTime) {
    const mktCloseTs = meta.regularMarketTime;
    const nowTs = Math.floor(Date.now() / 1000);
    // Post-market: up to 4h after close
    if (nowTs > mktCloseTs) {
      postPrice = findExtendedPrice(timestamps, closes, mktCloseTs + 60, mktCloseTs + 4 * 3600);
      if (postPrice != null) {
        postChange = postPrice - price;
        postChangePct = (postChange / price) * 100;
      }
    }
    // Pre-market: candles before regular open and after market open of previous day
    if (!postPrice && nowTs < mktCloseTs) {
      const dayStart = mktCloseTs - 24 * 3600;
      prePrice = findExtendedPrice(timestamps, closes, dayStart, regStart > 0 ? regStart : mktCloseTs - 6 * 3600);
      if (prePrice != null) {
        preChange = prePrice - prevClose;
        preChangePct = (preChange / prevClose) * 100;
      }
    }
  }

  // Find the most recent non-null open for first-candle fallback on opens
  let firstOpen: number | null = null;
  for (let i = 0; i < opens.length; i++) {
    if (opens[i] != null) { firstOpen = opens[i] as number; break; }
  }

  return {
    symbol,
    price,
    change,
    changePct,
    volume: meta.regularMarketVolume ?? 0,
    ma50: meta.fiftyDayAverage ?? 0,
    ma200: meta.twoHundredDayAverage ?? 0,
    dayHigh: meta.regularMarketDayHigh ?? price,
    dayLow: meta.regularMarketDayLow ?? price,
    open: meta.regularMarketOpen ?? firstOpen ?? price,
    prevClose,
    preMarketPrice:    prePrice,
    preMarketChange:   preChange,
    preMarketChangePct: preChangePct,
    postMarketPrice:   postPrice,
    postMarketChange:  postChange,
    postMarketChangePct: postChangePct,
  };
}

router.get("/quotes", async (req, res) => {
  const { symbols } = req.query;
  if (!symbols || typeof symbols !== "string") {
    res.status(400).json({ error: "symbols query param required" });
    return;
  }

  const symList = symbols.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  if (symList.length === 0) {
    res.status(400).json({ error: "no valid symbols" });
    return;
  }

  try {
    const results = await Promise.all(symList.map(s => fetchQuote(s)));
    const out: Record<string, QuoteResult> = {};
    for (let i = 0; i < symList.length; i++) {
      const r = results[i];
      if (r) out[symList[i]] = r;
    }
    res.json(out);
  } catch {
    res.status(500).json({ error: "fetch failed" });
  }
});

export default router;
