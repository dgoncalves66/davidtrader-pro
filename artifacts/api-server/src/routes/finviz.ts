import { Router } from "express";
import { parse } from "node-html-parser";

const router = Router();

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map<string, { ts: number; data: FinvizData }>();

export type FinvizData = {
  marketCap: string;
  income: string;
  sales: string;
  bookSh: string;
  pe: string;
  forwardPe: string;
  eps: string;
  recom: string;
  targetPrice: string;
  earnings: string;
  beta: string;
  shortFloat: string;
  high52w: string;
  low52w: string;
  grossMargin: string;
  profitMargin: string;
  roe: string;
  debtEq: string;
  recBuy: number;
  recHold: number;
  recSell: number;
};

function formatCurrency(raw: string): string {
  if (!raw || raw === "-") return "N/A";
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  if (raw.endsWith("T")) return `$${num.toFixed(2)}T`;
  if (raw.endsWith("B")) return num >= 1000 ? `$${(num / 1000).toFixed(2)}T` : `$${num.toFixed(2)}B`;
  if (raw.endsWith("M")) return `$${num.toFixed(0)}M`;
  return `$${raw}`;
}

function extractPrice(raw: string): string {
  if (!raw || raw === "-") return "N/A";
  const m = raw.match(/^[\d,.]+/);
  return m ? `$${m[0]}` : raw;
}

function fmt(v: string | undefined): string {
  if (!v || v.trim() === "-" || v.trim() === "") return "N/A";
  return v.trim();
}

async function fetchFinviz(symbol: string): Promise<FinvizData | null> {
  const url = `https://finviz.com/quote.ashx?t=${encodeURIComponent(symbol)}&ty=c&ta=1&p=d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;

  const root = parse(await res.text());
  const labels = root.querySelectorAll(".snapshot-td-label");
  const values = root.querySelectorAll(".snapshot-td-content");

  const data: Record<string, string> = {};
  for (let i = 0; i < Math.min(labels.length, values.length); i++) {
    const key = labels[i].text.trim();
    const val = values[i].text.trim();
    if (key && !data[key]) data[key] = val;
  }

  const recomStr = fmt(data["Recom"]);
  const recomVal = parseFloat(recomStr);

  let recBuy = 0, recHold = 0, recSell = 0;
  if (!isNaN(recomVal)) {
    if (recomVal <= 1.5)      { recBuy = 88; recHold = 10; recSell = 2; }
    else if (recomVal <= 2.0) { recBuy = 70; recHold = 25; recSell = 5; }
    else if (recomVal <= 2.5) { recBuy = 52; recHold = 38; recSell = 10; }
    else if (recomVal <= 3.0) { recBuy = 32; recHold = 50; recSell = 18; }
    else if (recomVal <= 3.5) { recBuy = 18; recHold = 50; recSell = 32; }
    else                      { recBuy = 8;  recHold = 28; recSell = 64; }
  }

  return {
    marketCap:    formatCurrency(fmt(data["Market Cap"])),
    income:       formatCurrency(fmt(data["Income"])),
    sales:        formatCurrency(fmt(data["Sales"])),
    bookSh:       data["Book/sh"] ? `$${fmt(data["Book/sh"])}` : "N/A",
    pe:           fmt(data["P/E"]),
    forwardPe:    fmt(data["Forward P/E"]),
    eps:          data["EPS (ttm)"] ? `$${fmt(data["EPS (ttm)"])}` : "N/A",
    recom:        recomStr,
    targetPrice:  data["Target Price"] ? `$${fmt(data["Target Price"])}` : "N/A",
    earnings:     fmt(data["Earnings"]),
    beta:         fmt(data["Beta"]),
    shortFloat:   fmt(data["Short Float"]),
    high52w:      extractPrice(fmt(data["52W High"])),
    low52w:       extractPrice(fmt(data["52W Low"])),
    grossMargin:  fmt(data["Gross Margin"]),
    profitMargin: fmt(data["Profit Margin"]),
    roe:          fmt(data["ROE"]),
    debtEq:       fmt(data["Debt/Eq"]),
    recBuy,
    recHold,
    recSell,
  };
}

router.get("/finviz", async (req, res) => {
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== "string") {
    res.status(400).json({ error: "symbol param required" });
    return;
  }

  const sym = symbol.toUpperCase().trim();
  const cached = cache.get(sym);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    res.json(cached.data);
    return;
  }

  try {
    const data = await fetchFinviz(sym);
    if (!data) { res.status(404).json({ error: "symbol not found" }); return; }
    cache.set(sym, { ts: Date.now(), data });
    res.json(data);
  } catch {
    res.status(500).json({ error: "finviz fetch failed" });
  }
});

export default router;
