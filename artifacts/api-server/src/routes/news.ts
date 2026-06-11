import { Router } from "express";

const router = Router();

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/rss+xml, application/xml, text/xml, */*",
};

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  tag: string;
  sym: string | null;
};

// ── simple RSS text extractor ────────────────────────────────────────────────
function extractTag(xml: string, tag: string): string {
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const start = xml.indexOf(open);
  if (start === -1) return "";
  const contentStart = xml.indexOf(">", start) + 1;
  const end = xml.indexOf(close, contentStart);
  if (end === -1) return "";
  return xml.slice(contentStart, end).replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

function parseItems(xml: string, sourceName: string, defaultTag: string, tagRules: [RegExp, string][], symMap: [RegExp, string][]): NewsItem[] {
  const items: NewsItem[] = [];
  let rest = xml;
  while (true) {
    const start = rest.indexOf("<item");
    if (start === -1) break;
    const end = rest.indexOf("</item>", start);
    if (end === -1) break;
    const chunk = rest.slice(start, end + 7);
    rest = rest.slice(end + 7);

    const title = extractTag(chunk, "title");
    const link = extractTag(chunk, "link") || extractTag(chunk, "guid");
    const pubDate = extractTag(chunk, "pubDate") || extractTag(chunk, "dc:date") || new Date().toUTCString();

    if (!title) continue;

    const sym = guessSymbol(title, symMap);
    const tag = guessTag(title, tagRules);

    items.push({ title, link, pubDate, source: sourceName, tag: tag || defaultTag, sym });
  }
  return items;
}

const SYMBOL_MAP: [RegExp, string][] = [
  [/\bNVDA\b|nvidia/i, "NVDA"],
  [/\bAAPL\b|apple/i, "AAPL"],
  [/\bMSFT\b|microsoft/i, "MSFT"],
  [/\bGOOGL?\b|alphabet/i, "GOOGL"],
  [/\bMETA\b|facebook/i, "META"],
  [/\bTSLA\b|tesla/i, "TSLA"],
  [/\bAMZN\b|amazon/i, "AMZN"],
  [/\bJPM\b|jpmorgan/i, "JPM"],
  [/\bSPY\b|s&p 500|s&p500/i, "SPY"],
  [/\bQQQ\b|nasdaq/i, "QQQ"],
  [/\bBRK\b|berkshire/i, "BRK.B"],
  [/\bAVGO\b|broadcom/i, "AVGO"],
  [/\bPLTR\b|palantir/i, "PLTR"],
  [/\bIWM\b|russell/i, "IWM"],
  [/fed|fomc|powell|tasas|rates/i, "SPY"],
];

function guessSymbol(title: string, map: [RegExp, string][]): string | null {
  for (const [re, sym] of map) {
    if (re.test(title)) return sym;
  }
  return null;
}

const TAG_RULES_EN: [RegExp, string][] = [
  [/earnings|revenue|profit|results|guidance|eps|quarterly/i, "EARNINGS"],
  [/fed|fomc|powell|ecb|central bank|interest rate|inflation|macro|employment|gdp|recession|tariff/i, "MACRO"],
  [/acqui|merger|split|buyback|dividend|ipo|offering|deal|stake/i, "COMPANY"],
  [/\$[A-Z]{2,5}|bullish|bearish|breakout|support|resistance|signal|setup|upgrade|downgrade|target/i, "ANALYSIS"],
];

const TAG_RULES_ES: [RegExp, string][] = [
  [/ganancias|ingresos|beneficios|resultados|trimestral|eps/i, "EARNINGS"],
  [/fed|fomc|powell|inflaci[oó]n|banco central|tasas|empleo|pib|recesi[oó]n|aranceles/i, "MACRO"],
  [/adquisici[oó]n|fusi[oó]n|dividendo|ipo|oferta|recompra|acuerdo/i, "COMPANY"],
  [/alcista|bajista|soporte|resistencia|se[nñ]al|objetivo|ruptura|an[aá]lisis|subida|ca[ií]da/i, "ANALYSIS"],
];

function guessTag(title: string, rules: [RegExp, string][]): string | null {
  for (const [re, tag] of rules) {
    if (re.test(title)) return tag;
  }
  return null;
}

// ── feed definitions ─────────────────────────────────────────────────────────
const FEEDS_EN = [
  { url: "https://www.investing.com/rss/news.rss",          source: "Investing.com",         tag: "MACRO" },
  { url: "https://www.investing.com/rss/news_25.rss",       source: "Investing.com · Stocks", tag: "COMPANY" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=US&lang=en-US",                              source: "Yahoo Finance",         tag: "MACRO" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NVDA%2CAAPL%2CTSLA%2CMETA%2CMSFT&region=US&lang=en-US",   source: "Yahoo Finance · Tech",  tag: "COMPANY" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY%2CQQQ%2CIWM%2CDIA&region=US&lang=en-US",              source: "Yahoo Finance · ETFs",  tag: "MACRO" },
];

const FEEDS_ES = [
  { url: "https://es.investing.com/rss/news.rss",              source: "Investing.com ES",              tag: "MACRO" },
  { url: "https://es.investing.com/rss/news_25.rss",           source: "Investing.com ES · Acciones",   tag: "COMPANY" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EGSPC&region=MX&lang=es-MX",                              source: "Yahoo Finance ES",              tag: "MACRO" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=NVDA%2CAAPL%2CTSLA%2CMETA%2CMSFT&region=MX&lang=es-MX",   source: "Yahoo Finance ES · Tech",       tag: "COMPANY" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY%2CQQQ%2CIWM%2CDIA&region=MX&lang=es-MX",              source: "Yahoo Finance ES · ETFs",       tag: "MACRO" },
];

// ── per-language cache ────────────────────────────────────────────────────────
type Cache = { items: NewsItem[]; lastFetch: number };
const caches: Record<"en" | "es", Cache> = {
  en: { items: [], lastFetch: 0 },
  es: { items: [], lastFetch: 0 },
};
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFeed(feed: { url: string; source: string; tag: string }, tagRules: [RegExp, string][]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml, feed.source, feed.tag, tagRules, SYMBOL_MAP);
  } catch {
    return [];
  }
}

function deduplicate(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    const key = item.title.slice(0, 60).toLowerCase().replace(/\s+/g, " ");
    if (!seen.has(key)) { seen.add(key); out.push(item); }
  }
  return out;
}

async function refreshNews(lang: "en" | "es"): Promise<NewsItem[]> {
  const feeds = lang === "es" ? FEEDS_ES : FEEDS_EN;
  const tagRules = lang === "es" ? TAG_RULES_ES : TAG_RULES_EN;
  const results = await Promise.all(feeds.map(f => fetchFeed(f, tagRules)));
  const deduped = deduplicate(results.flat());
  deduped.sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0));
  return deduped.slice(0, 40);
}

router.get("/news", async (req, res) => {
  const lang = (req.query.lang === "es") ? "es" : "en";
  const cache = caches[lang];
  const now = Date.now();

  if (now - cache.lastFetch > CACHE_TTL || cache.items.length === 0) {
    try {
      cache.items = await refreshNews(lang);
      cache.lastFetch = now;
    } catch (err) {
      req.log.error({ err }, `news refresh failed (lang=${lang})`);
      if (cache.items.length === 0) {
        res.status(502).json({ error: "Failed to fetch news" });
        return;
      }
    }
  }
  res.json(cache.items);
});

export default router;
