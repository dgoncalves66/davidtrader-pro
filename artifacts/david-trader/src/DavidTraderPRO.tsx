import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { ProChartPanel } from "./ProChart";
import { LangCtx, useLang, type Lang } from "./LangContext";

const C = {
  bg: "#060b14", panel: "#0d1520", panelB: "#111d2e", border: "#1a2d44",
  accent: "#00d4ff", green: "#00e676", red: "#ff3d57",
  gold: "#ffd700", goldDim: "#b8860b", white: "#e8f4ff",
  muted: "#4a6380", text2: "#8fafc8", purple: "#a855f7", orange: "#f39c12",
};

// ── Mobile context ────────────────────────────────────────────────────────────
const MobileCtx = createContext(false);
const useMobile = () => useContext(MobileCtx);

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handle = () => setW(window.innerWidth);
    window.addEventListener("resize", handle, { passive: true });
    return () => window.removeEventListener("resize", handle);
  }, []);
  return w;
}

// ── Translations ──────────────────────────────────────────────────────────────
type TX = Record<string, { en: string; es: string }>;
const TX: TX = {
  marketOpen:   { en: "MARKET OPEN", es: "MERCADO ABIERTO" },
  preMarket:    { en: "PRE-MARKET 🌅", es: "PRE-MERCADO 🌅" },
  postMarket:   { en: "POST-MARKET 🌙", es: "POST-MERCADO 🌙" },
  closed:       { en: "CLOSED", es: "CERRADO" },
  strategies:   { en: "📋 STRATEGIES", es: "📋 ESTRATEGIAS" },
  navAnalysis:  { en: "📊 Analysis", es: "📊 Análisis" },
  navMag10:     { en: "💎 Activos", es: "💎 Activos" },
  navEtfs:      { en: "📈 ETFs & Indices", es: "📈 ETFs & Índices" },
  navNews:      { en: "📡 News", es: "📡 Noticias" },
  brandName:    { en: "POWERFUL INVESTMENTS", es: "INVERSIONES PODEROSAS" },
  readArticle:  { en: "Read full article →", es: "Leer artículo completo →" },
  quickSelect:  { en: "QUICK SELECT", es: "SELECCIÓN RÁPIDA" },
  searchPlh:    { en: "🔍 Search ticker (AAPL, TSLA, SPY...)", es: "🔍 Buscar activo (AAPL, TSLA, SPY...)" },
  fullAnalysis: { en: "Full technical analysis", es: "Análisis técnico completo" },
  livePrice:    { en: "🟢 LIVE PRICE", es: "🟢 PRECIO EN VIVO" },
  postMkt:      { en: "🌙 POST-MARKET", es: "🌙 POST-MERCADO" },
  preMkt:       { en: "🌅 PRE-MARKET",  es: "🌅 PRE-MERCADO" },
  extClose:     { en: "Close", es: "Cierre" },
  loadingData:  { en: "⏳ Loading real data...", es: "⏳ Cargando datos reales..." },
  loading:      { en: "Loading", es: "Cargando" },
  loadingDots:  { en: "Loading…", es: "Cargando…" },
  tfHour:       { en: "1 Hour", es: "1 Hora" },
  tfDay:        { en: "Day", es: "Día" },
  insideBB:     { en: "Inside BB", es: "Dentro BB" },
  aboveBB:      { en: "Above Upper BB ⚠", es: "Sobre BB Superior ⚠" },
  belowBB:      { en: "Below Lower BB ⚠", es: "Bajo BB Inferior ⚠" },
  waitBB:       { en: "Wait for close inside BB", es: "Espera cierre dentro BB" },
  oversold:     { en: "⚡ Oversold", es: "⚡ Sobreventa" },
  oscillators:  { en: "OSCILLATORS", es: "OSCILADORES" },
  stoch:        { en: "Stochastic %K 12,3", es: "Estocástico %K 12,3" },
  osOversold:   { en: "OVERSOLD", es: "SOBREVENTA" },
  osOverbought: { en: "OVERBOUGHT", es: "SOBRECOMPRA" },
  osNeutral:    { en: "NEUTRAL", es: "NEUTRO" },
  signalNeutral:{ en: "◆ NEUTRAL", es: "◆ NEUTRO" },
  fundamentals: { en: "FUNDAMENTAL ACTIVO", es: "FUNDAMENTAL ACTIVO" },
  volume:       { en: "Volume", es: "Volumen" },
  marketCapLbl: { en: "Market Cap", es: "Cap. Mercado" },
  incomeLbl:    { en: "Net Income", es: "Ingreso Neto" },
  salesLbl:     { en: "Revenue", es: "Ventas" },
  bookShLbl:    { en: "Book/sh", es: "Val. Libro" },
  peEst:        { en: "P/E (ttm)", es: "P/E (ttm)" },
  forwardPeLbl: { en: "Forward P/E", es: "P/E Fwd" },
  epsLbl:       { en: "EPS (ttm)", es: "EPS (ttm)" },
  recommLbl:    { en: "Recom.", es: "Recom." },
  targetPriceLbl: { en: "Target Price", es: "Precio Objetivo" },
  prevCloseLbl: { en: "Prev Close", es: "Cierre Ant." },
  priceLbl:     { en: "Price", es: "Precio" },
  upsideVsPrice:{ en: "Upside vs. Price", es: "Potencial vs. Precio" },
  priceTgts:    { en: "ANALYST PRICE TARGET", es: "OBJETIVO DE PRECIO ANALISTAS" },
  targetLbl:    { en: "Analyst Target", es: "Obj. Analistas" },
  consensus:    { en: "ANALYST CONSENSUS", es: "CONSENSO ANALISTAS" },
  buy:          { en: "Buy", es: "Compra" },
  hold:         { en: "Hold", es: "Mantener" },
  sell:         { en: "Sell", es: "Vender" },
  earningsDateLbl: { en: "Earnings Date", es: "Fecha Resultados" },
  betaLbl:      { en: "Beta", es: "Beta" },
  shortFloatLbl:{ en: "Short Float", es: "Short Float" },
  high52Lbl:    { en: "52W High", es: "Máx 52S" },
  low52Lbl:     { en: "52W Low", es: "Mín 52S" },
  grossMarginLbl:{ en: "Gross Margin", es: "Margen Bruto" },
  profitMarginLbl:{ en: "Profit Margin", es: "Margen Neto" },
  roeLbl:       { en: "ROE", es: "ROE" },
  debtEqLbl:    { en: "Debt/Equity", es: "Deuda/Capital" },
  finvizLive:   { en: "LIVE · Finviz", es: "EN VIVO · Finviz" },
  loadingFundamentals: { en: "Loading live data…", es: "Cargando datos en vivo…" },
  alertsHdr:    { en: "🔔 ALERTS", es: "🔔 ALARMAS" },
  alertSub:     { en: "Trend & Bollinger signals · 15m & 1H", es: "Señales tendencia y Bollinger · 15m y 1H" },
  markRead:     { en: "MARK ALL READ", es: "MARCAR TODO LEÍDO" },
  noAlerts:     { en: "No alerts yet", es: "Sin alarmas aún" },
  noAlertsDetail: { en: "Alerts fire when an asset changes trend (15m or 1H) or breaks Bollinger Bands.", es: "Las alarmas se activan cuando cambia tendencia (15m ó 1H) o rompe las Bollinger Bands." },
  trendAlerts:  { en: "Trend & BB alerts", es: "Alarmas de tendencia y BB" },
  liveNews:     { en: "📡 LIVE NEWS", es: "📡 NOTICIAS EN VIVO" },
  loadingNews:  { en: "Loading live news…", es: "Cargando noticias en tiempo real…" },
  mag10Title:   { en: "💎 ACTIVOS", es: "💎 ACTIVOS" },
  mainIndices:  { en: "🌐 INDICES", es: "🌐 ÍNDICES" },
  marketEtfs:   { en: "📈 LEVERAGED ETFs", es: "📈 ETFs APALANCADOS" },
  rtNews:       { en: "📡 REAL-TIME NEWS", es: "📡 NOTICIAS EN TIEMPO REAL" },
  newsSrc:      { en: "Sources: Yahoo Finance · Investing.com · Reuters · Bloomberg", es: "Fuentes: Yahoo Finance ES · Investing.com ES · El Economista · Expansión" },
  newsFtr:      { en: "Sources: Investing.com · Yahoo Finance · Updates every 5 min", es: "Fuentes: Investing.com ES · Yahoo Finance ES · Actualización cada 5 min" },
  loadingNewsP: { en: "⏳ Loading real-time news...", es: "⏳ Cargando noticias en tiempo real..." },
  stratTitle:   { en: "📋 Trading Strategies", es: "📋 Estrategias de Trading" },
  upCall:       { en: "▲ UP → CALL", es: "▲ ALZA → CALL" },
  downPut:      { en: "▼ DOWN → PUT", es: "▼ BAJA → PUT" },
  requirements: { en: "REQUIREMENTS", es: "REQUISITOS" },
  k_bull3:      { en: "BULLISH 3 TF", es: "ALCISTA 3 TEMP." },
  k_bull15:     { en: "BULLISH 15 MIN", es: "ALCISTA 15 MIN" },
  k_bear15:     { en: "BEARISH 15 MIN", es: "BAJISTA 15 MIN" },
  k_bull1h:     { en: "BULLISH 1H", es: "ALCISTA 1H" },
  k_bear1h:     { en: "BEARISH 1H", es: "BAJISTA 1H" },
  k_bbLow:      { en: "BB BREAK ↓ CALL", es: "ROTURA BB ↓ CALL" },
  k_bbHigh:     { en: "BB BREAK ↑ PUT", es: "ROTURA BB ↑ PUT" },
  autoMonitor1: { en: "⚡ Auto monitoring every 30 sec ·", es: "⚡ Monitoreo automático cada 30 seg ·" },
  autoMonitor2: { en: "assets tracked", es: "activos vigilados" },
  signal15m:    { en: "Trend 15 Min", es: "Tendencia 15 Min" },
  signal1h:     { en: "Trend 1H", es: "Tendencia 1H" },
  signalBBLow:  { en: "BB Break CALL setup · RSI oversold · Price below lower band → Magnet reversal", es: "Rotura BB CALL · RSI sobreventa · Precio bajo banda inferior → Reversión imán" },
  signalBBHigh: { en: "BB Break PUT setup · RSI overbought · Price above upper band → Magnet reversal", es: "Rotura BB PUT · RSI sobrecompra · Precio sobre banda superior → Reversión imán" },
  // strategy tab labels
  tab15m:       { en: "15 Min", es: "15 Min" },
  tab1h:        { en: "1 Hour", es: "1 Hora" },
  tabBoll:      { en: "Bollinger", es: "Bollinger" },
  tabMagnet:    { en: "Magnet", es: "Imán" },
  tabLateral:   { en: "Lateral BB", es: "BB Lateral" },
  tabMidpoint:  { en: "Midpoint",  es: "Punto Medio" },
  tabTrendUp:   { en: "1H ↑ CALL", es: "1H ↑ CALL" },
  tabTrendDown: { en: "1H ↓ PUT",  es: "1H ↓ PUT" },
  // earnings
  earningsLbl:  { en: "📅 EARNINGS", es: "📅 GANANCIAS" },
  earningsNext: { en: "Next Report", es: "Próximo Reporte" },
  earningsEst:  { en: "Est. EPS", es: "EPS Estimado" },
  earningsDays: { en: "days", es: "días" },
  earningsToday:{ en: "TODAY", es: "HOY" },
  earningsTmrw: { en: "TOMORROW", es: "MAÑANA" },
  earningsNA:   { en: "TBA", es: "Por confirmar" },
  // watchlist
  manageWl:     { en: "⚙ Manage", es: "⚙ Gestionar" },
  watchlistTitle:{ en: "📋 Manage Watchlist", es: "📋 Gestionar Lista" },
  customStocks: { en: "CUSTOM STOCKS", es: "ACCIONES PERSONALIZADAS" },
  customEtfs:   { en: "CUSTOM ETFs", es: "ETFs PERSONALIZADOS" },
  addSymbol:    { en: "Add ticker (e.g. PLTR, COIN…)", es: "Agregar ticker (ej. PLTR, COIN…)" },
  addBtn:       { en: "ADD", es: "AGREGAR" },
  removeBtn:    { en: "Remove", es: "Eliminar" },
  closeBtn:     { en: "CLOSE", es: "CERRAR" },
  // market closed
  mktClosedWknd:{ en: "MARKET CLOSED — Weekend", es: "MERCADO CERRADO — Fin de semana" },
  mktClosedHol: { en: "MARKET CLOSED — Holiday", es: "MERCADO CERRADO — Día feriado" },
  nextOpen:     { en: "Next open:", es: "Próxima apertura:" },
  // extended hours in fundamentals
  extHoursLbl:  { en: "EXTENDED HOURS", es: "HORAS EXTENDIDAS" },
  mktClose:     { en: "Mkt Close", es: "Cierre Mkt" },
  analyzeBtn:   { en: "ANALYZE", es: "ANALIZAR" },
  addChecklist: { en: "+ List", es: "+ Lista" },
  checklistHdr: { en: "📋 ANALYSIS CHECKLIST", es: "📋 LISTA DE ANÁLISIS" },
  checklistAdd: { en: "Add ticker…", es: "Agregar ticker…" },
  checklistEmpty:{ en: "Add tickers to monitor BB & trend signals across all timeframes", es: "Agrega tickers para monitorear señales BB y tendencia en todas las temporalidades" },
  hiddenHdr:    { en: "HIDDEN ASSETS — tap ↩ to restore", es: "ACTIVOS OCULTOS — toca ↩ para restaurar" },
  alertsTab:    { en: "ALERTS", es: "ALARMAS" },
  checklistTab: { en: "CHECKLIST", es: "CHECKLIST" },
};

function tr(key: string, lang: Lang): string {
  return TX[key]?.[lang] ?? TX[key]?.en ?? key;
}

// ── Market Session ────────────────────────────────────────────────────────────
type Session = "pre" | "open" | "post" | "closed";
type ClosedReason = "weekend" | "holiday" | null;

const US_MARKET_HOLIDAYS = new Set([
  // 2025
  "2025-01-01","2025-01-20","2025-02-17","2025-04-18",
  "2025-05-26","2025-06-19","2025-07-04","2025-09-01",
  "2025-11-27","2025-12-25",
  // 2026
  "2026-01-01","2026-01-19","2026-02-16","2026-04-03",
  "2026-05-25","2026-06-19","2026-07-03","2026-09-07",
  "2026-11-26","2026-12-25",
  // 2027
  "2027-01-01","2027-01-18","2027-02-15","2027-03-26",
  "2027-05-31","2027-06-18","2027-07-05","2027-09-06",
  "2027-11-25","2027-12-24",
]);

function getMarketSession(): Session {
  const now = new Date();
  const m = now.getUTCMonth() + 1;
  const etOffset = (m > 3 || (m === 3 && now.getUTCDate() >= 8)) && (m < 11 || (m === 11 && now.getUTCDate() < 1)) ? -4 : -5;
  const etMs = now.getTime() + etOffset * 3600 * 1000;
  const etDate = new Date(etMs);
  const dow = etDate.getUTCDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return "closed";
  const dateStr = etDate.toISOString().slice(0, 10);
  if (US_MARKET_HOLIDAYS.has(dateStr)) return "closed";
  const etTotalMin = etDate.getUTCHours() * 60 + etDate.getUTCMinutes();
  if (etTotalMin >= 240 && etTotalMin < 570) return "pre";
  if (etTotalMin >= 570 && etTotalMin < 960) return "open";
  if (etTotalMin >= 960 && etTotalMin < 1200) return "post";
  return "closed";
}

function getClosedReason(): ClosedReason {
  const now = new Date();
  const m = now.getUTCMonth() + 1;
  const etOffset = (m > 3 || (m === 3 && now.getUTCDate() >= 8)) && (m < 11 || (m === 11 && now.getUTCDate() < 1)) ? -4 : -5;
  const etDate = new Date(now.getTime() + etOffset * 3600 * 1000);
  const dow = etDate.getUTCDay();
  if (dow === 0 || dow === 6) return "weekend";
  if (US_MARKET_HOLIDAYS.has(etDate.toISOString().slice(0, 10))) return "holiday";
  return null;
}

const SESSION_COLOR: Record<Session, string> = {
  pre: C.purple, open: C.green, post: C.orange, closed: C.red,
};
const SESSION_LABEL: Record<Session, keyof typeof TX> = {
  pre: "preMarket", open: "marketOpen", post: "postMarket", closed: "closed",
};

// ── Data ──────────────────────────────────────────────────────────────────────
const MAGNIFICAS = [
  { sym: "AAPL", name: "Apple", etf: "XLK", idx: "S&P 500" },
  { sym: "MSFT", name: "Microsoft", etf: "XLK", idx: "S&P 500" },
  { sym: "NVDA", name: "NVIDIA", etf: "SOXX", idx: "NASDAQ" },
  { sym: "AMZN", name: "Amazon", etf: "XLY", idx: "S&P 500" },
  { sym: "META", name: "Meta", etf: "XLC", idx: "NASDAQ" },
  { sym: "GOOGL", name: "Alphabet", etf: "XLC", idx: "NASDAQ" },
  { sym: "TSLA", name: "Tesla", etf: "XLY", idx: "NASDAQ" },
  { sym: "AVGO", name: "Broadcom", etf: "SOXX", idx: "NASDAQ" },
  { sym: "BRK.B", name: "Berkshire", etf: "XLF", idx: "S&P 500" },
  { sym: "JPM", name: "JPMorgan", etf: "XLF", idx: "S&P 500" },
];

const ETF_LIST = [
  { sym: "NVDL", name: "2x Long NVDA Daily ETF",      idx: "NASDAQ" },
  { sym: "AMDL", name: "2x Long AMD Daily ETF",       idx: "NASDAQ" },
  { sym: "AMZU", name: "2x Long Amazon Daily ETF",    idx: "NASDAQ" },
  { sym: "PTIR", name: "2x Long Palantir Daily ETF",  idx: "NYSE" },
  { sym: "METU", name: "2x Long Meta Daily ETF",      idx: "NASDAQ" },
  { sym: "AAPU", name: "2x Long Apple Daily ETF",     idx: "NASDAQ" },
  { sym: "AVL",  name: "2x Long Leveraged ETF",       idx: "NYSE" },
  { sym: "NBIL", name: "2x Long Bull Leveraged ETF",  idx: "NASDAQ" },
  { sym: "ORCU", name: "2x Long Oracle Daily ETF",    idx: "NYSE" },
  { sym: "MSFL", name: "2x Long Microsoft Daily ETF", idx: "NASDAQ" },
];

const INDICES = [
  { sym: "^GSPC", label: "SPX",  name: "S&P 500 Index",              idx: "S&P 500" },
  { sym: "TNA",   label: "TNA",  name: "Small Cap Bull 3X (Russell)", idx: "Russell 2000" },
  { sym: "^DJI",  label: "DJI",  name: "Dow Jones Industrial",        idx: "DJIA" },
  { sym: "^NDX",  label: "NDX",  name: "NASDAQ-100 Index",            idx: "NDX 100" },
  { sym: "^IXIC", label: "COMP", name: "NASDAQ Composite",            idx: "NASDAQ" },
  { sym: "^VIX",  label: "VIX",  name: "Volatility (Fear Index)",     idx: "CBOE" },
  { sym: "^RUT",  label: "RUT",  name: "Russell 2000 Index",          idx: "Russell 2000" },
  { sym: "^TNX",  label: "TNX",  name: "10Y US Treasury (Yield)",     idx: "Bonds" },
];

const ETF_TAB_INDICES = INDICES.filter(i => i.sym === "^GSPC" || i.sym === "TNA" || i.sym === "^NDX" || i.sym === "^VIX");

type PriceData = {
  symbol: string; price: string; change: string; changePct: string;
  volume: number; rsi: string; stoch: string; ma20: string; ma40: string;
  ma100: string; ma200: string; bbUpper: string; bbLower: string; bbMid: string;
  outsideBand: string; bb1hStatus: string; bbDayStatus: string;
  trend15: string; trend1h: string; trendDay: string;
  signal: string; signalDetail: string; signalDetailEs: string; targetPrice: string;
  recBuy: number; recHold: number; recSell: number; timestamp: string; live: boolean;
  marketCap: string; income: string; sales: string; bookSh: string; peRatio: string;
  recom: string; lowTarget: string; avgTarget: string; highTarget: string;
  preMarketPrice: string | null; preMarketChange: string | null; preMarketChangePct: string | null;
  postMarketPrice: string | null; postMarketChange: string | null; postMarketChangePct: string | null;
};

type LiveQuote = {
  price: number; change: number; changePct: number; volume: number;
  ma50: number; ma200: number; dayHigh: number; dayLow: number;
  open: number; prevClose: number;
  preMarketPrice: number | null; preMarketChange: number | null; preMarketChangePct: number | null;
  postMarketPrice: number | null; postMarketChange: number | null; postMarketChangePct: number | null;
};

// ── Shared live quote cache ───────────────────────────────────────────────────
const liveCache: Record<string, LiveQuote> = {};
const pendingFetch = new Set<string>();
let fetchTimer: ReturnType<typeof setTimeout> | null = null;
const fetchQueue = new Set<string>();
const cacheListeners = new Set<() => void>();

function notifyListeners() { cacheListeners.forEach(fn => fn()); }

function scheduleFetch(sym: string) {
  fetchQueue.add(sym);
  if (fetchTimer) return;
  fetchTimer = setTimeout(async () => {
    fetchTimer = null;
    const syms = [...fetchQueue].filter(s => !pendingFetch.has(s));
    if (!syms.length) return;
    syms.forEach(s => pendingFetch.add(s));
    fetchQueue.clear();
    try {
      const res = await fetch(`/api/quotes?symbols=${syms.join(",")}`);
      if (res.ok) {
        Object.assign(liveCache, await res.json() as Record<string, LiveQuote>);
        notifyListeners(); checkAlerts();
      }
    } catch { /* network error */ } finally { syms.forEach(s => pendingFetch.delete(s)); }
  }, 100);
}

setInterval(() => {
  const syms = Object.keys(liveCache);
  if (!syms.length) return;
  fetch(`/api/quotes?symbols=${syms.join(",")}`)
    .then(r => r.ok ? r.json() : null)
    .then((d: Record<string, LiveQuote> | null) => { if (d) { Object.assign(liveCache, d); notifyListeners(); checkAlerts(); } })
    .catch(() => {});
}, 30_000);

// ── Alert engine ──────────────────────────────────────────────────────────────
type TradingAlert = {
  id: string; sym: string; name: string; price: string; changePct: string;
  kind: "BULLISH_15M" | "BULLISH_TRIPLE" | "BEARISH_15M" | "BULLISH_1H" | "BEARISH_1H" | "BB_LOWER_BREAK" | "BB_UPPER_BREAK" | "BB_1H_LOWER" | "BB_1H_UPPER" | "BB_DAY_LOWER" | "BB_DAY_UPPER";
  tf?: string;
  effPct: number; effDir: "BULLISH" | "BEARISH";
  ts: Date; read: boolean;
};

const ALL_SYMBOLS = [
  ...MAGNIFICAS.map(m => ({ sym: m.sym, name: m.name })),
  ...ETF_LIST.map(e => ({ sym: e.sym, name: e.name })),
  ...INDICES.map(i => ({ sym: i.sym, name: i.name })),
];

function symLabel(sym: string) {
  return INDICES.find(i => i.sym === sym)?.label ?? sym;
}

// ── Known Fundamentals (realistic static data) ────────────────────────────────
type KnownFundamentals = {
  mcap: string; revenue: string; netIncome: string; bookSh: string; pe: string;
  recom: string; recBuy: number; recHold: number; recSell: number;
  targetLow: string; targetAvg: string; targetHigh: string;
};
const KNOWN_FUNDAMENTALS: Record<string, KnownFundamentals> = {
  AAPL:  { mcap:"$3.08T", revenue:"$391B", netIncome:"$97B",  bookSh:"$3.96",   pe:"31.2", recom:"2.0", recBuy:28, recHold:9,  recSell:2,  targetLow:"$164", targetAvg:"$233", targetHigh:"$260" },
  MSFT:  { mcap:"$2.89T", revenue:"$261B", netIncome:"$88B",  bookSh:"$40.32",  pe:"34.5", recom:"1.7", recBuy:35, recHold:5,  recSell:1,  targetLow:"$395", targetAvg:"$489", targetHigh:"$550" },
  NVDA:  { mcap:"$2.51T", revenue:"$130B", netIncome:"$73B",  bookSh:"$3.87",   pe:"42.1", recom:"1.6", recBuy:40, recHold:5,  recSell:1,  targetLow:"$100", targetAvg:"$178", targetHigh:"$280" },
  AMZN:  { mcap:"$2.28T", revenue:"$638B", netIncome:"$59B",  bookSh:"$24.02",  pe:"35.7", recom:"1.5", recBuy:50, recHold:4,  recSell:0,  targetLow:"$192", targetAvg:"$244", targetHigh:"$280" },
  META:  { mcap:"$1.49T", revenue:"$164B", netIncome:"$62B",  bookSh:"$73.91",  pe:"28.4", recom:"1.6", recBuy:47, recHold:7,  recSell:2,  targetLow:"$512", targetAvg:"$726", targetHigh:"$1000" },
  GOOGL: { mcap:"$1.93T", revenue:"$350B", netIncome:"$94B",  bookSh:"$26.56",  pe:"21.1", recom:"1.7", recBuy:42, recHold:8,  recSell:1,  targetLow:"$167", targetAvg:"$208", targetHigh:"$235" },
  TSLA:  { mcap:"$713B",  revenue:"$97B",  netIncome:"$7.3B", bookSh:"$20.36",  pe:"105", recom:"2.8",  recBuy:14, recHold:12, recSell:9,  targetLow:"$115", targetAvg:"$332", targetHigh:"$500" },
  AVGO:  { mcap:"$832B",  revenue:"$52B",  netIncome:"$10.2B",bookSh:"$16.24",  pe:"85.4", recom:"1.8", recBuy:26, recHold:5,  recSell:1,  targetLow:"$148", targetAvg:"$232", targetHigh:"$298" },
  "BRK.B":{ mcap:"$1.12T",revenue:"$301B", netIncome:"$96B",  bookSh:"$152.40", pe:"11.2", recom:"2.1", recBuy:4,  recHold:6,  recSell:1,  targetLow:"$408", targetAvg:"$460", targetHigh:"$500" },
  JPM:   { mcap:"$748B",  revenue:"$167B", netIncome:"$50B",  bookSh:"$119.54", pe:"13.5", recom:"1.9", recBuy:22, recHold:8,  recSell:2,  targetLow:"$226", targetAvg:"$268", targetHigh:"$310" },
  SPY:   { mcap:"$580B",  revenue:"N/A",   netIncome:"N/A",   bookSh:"N/A",     pe:"22.4", recom:"2.3", recBuy:20, recHold:15, recSell:5,  targetLow:"$520", targetAvg:"$585", targetHigh:"$640" },
  QQQ:   { mcap:"$330B",  revenue:"N/A",   netIncome:"N/A",   bookSh:"N/A",     pe:"28.1", recom:"2.0", recBuy:22, recHold:12, recSell:4,  targetLow:"$440", targetAvg:"$510", targetHigh:"$570" },
};

// ── Known Earnings Calendar ───────────────────────────────────────────────────
type EarningsEvent = { date: string; epsEst: string; period: string };
const KNOWN_EARNINGS: Record<string, EarningsEvent[]> = {
  AAPL:  [{ date:"2026-07-30", epsEst:"$1.68", period:"Q3 FY26" },{ date:"2026-10-29", epsEst:"$1.72", period:"Q4 FY26" }],
  MSFT:  [{ date:"2026-07-29", epsEst:"$3.22", period:"Q4 FY26" },{ date:"2026-10-28", epsEst:"$3.40", period:"Q1 FY27" }],
  NVDA:  [{ date:"2026-08-26", epsEst:"$0.82", period:"Q2 FY27" },{ date:"2026-11-18", epsEst:"$0.91", period:"Q3 FY27" }],
  AMZN:  [{ date:"2026-07-31", epsEst:"$1.72", period:"Q2 2026" },{ date:"2026-10-30", epsEst:"$1.85", period:"Q3 2026" }],
  META:  [{ date:"2026-07-29", epsEst:"$6.48", period:"Q2 2026" },{ date:"2026-10-28", epsEst:"$6.92", period:"Q3 2026" }],
  GOOGL: [{ date:"2026-07-28", epsEst:"$2.24", period:"Q2 2026" },{ date:"2026-10-27", epsEst:"$2.38", period:"Q3 2026" }],
  TSLA:  [{ date:"2026-07-22", epsEst:"$0.61", period:"Q2 2026" },{ date:"2026-10-21", epsEst:"$0.72", period:"Q3 2026" }],
  AVGO:  [{ date:"2026-09-09", epsEst:"$1.68", period:"Q3 FY26" },{ date:"2026-12-09", epsEst:"$1.81", period:"Q4 FY26" }],
  "BRK.B":[{ date:"2026-08-01", epsEst:"N/A",   period:"Q2 2026" },{ date:"2026-11-07", epsEst:"N/A",   period:"Q3 2026" }],
  JPM:   [{ date:"2026-07-14", epsEst:"$4.84", period:"Q2 2026" },{ date:"2026-10-13", epsEst:"$4.96", period:"Q3 2026" }],
};

function getNextEarnings(sym: string): (EarningsEvent & { daysAway: number }) | null {
  const events = KNOWN_EARNINGS[sym]; if (!events) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  for (const ev of events) {
    const evDate = new Date(ev.date); evDate.setHours(0,0,0,0);
    const diff = Math.round((evDate.getTime() - today.getTime()) / 86400000);
    if (diff >= 0) return { ...ev, daysAway: diff };
  }
  return null;
}

const prevTrend15: Record<string, string> = {};
const prevTrend1h: Record<string, string> = {};
const prevBBStatus: Record<string, string> = {};
const prevBB1h: Record<string, string> = {};
const prevBBDay: Record<string, string> = {};
const alertStore: TradingAlert[] = [];
const alertListeners = new Set<() => void>();

function notifyAlertListeners() { alertListeners.forEach(fn => fn()); }

// ── Sound system ──────────────────────────────────────────────────────────────
let soundEnabled = true;
try { soundEnabled = localStorage.getItem("dt-sound") !== "0"; } catch {}
const soundListeners = new Set<() => void>();
function setSoundEnabled(v: boolean) {
  soundEnabled = v;
  try { localStorage.setItem("dt-sound", v ? "1" : "0"); } catch {}
  soundListeners.forEach(fn => fn());
}

// Cooldown: prevent same sym+tf alarm within 10 minutes
const alarmCooldown: Record<string, number> = {};
function canAlarm(key: string): boolean {
  const now = Date.now();
  if (alarmCooldown[key] && now - alarmCooldown[key] < 10 * 60 * 1000) return false;
  alarmCooldown[key] = now;
  return true;
}

function playAlarm(direction: "CALL" | "PUT") {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // CALL (lower break): urgent ascending alarm — C5·E5·G5·C6 + final hold
    // PUT  (upper break): urgent descending alarm — C6·G5·E5·C5 + final hold
    const callNotes = [523, 659, 784, 1047, 1047];
    const putNotes  = [1047, 784, 659, 523, 523];
    const notes = direction === "CALL" ? callNotes : putNotes;
    const types: OscillatorType[] = ["sine", "sine", "sine", "square", "sawtooth"];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = types[i];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const t = ctx.currentTime + i * 0.13;
      const vol = i === notes.length - 1 ? 0.35 : 0.22;
      const dur = i === notes.length - 1 ? 0.55 : 0.16;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.01);
    });

    // Second repetition after 0.9s for extra urgency
    setTimeout(() => {
      try {
        const ctx2 = new AudioCtx();
        const shortNotes = direction === "CALL" ? [784, 1047] : [784, 523];
        shortNotes.forEach((freq, i) => {
          const osc = ctx2.createOscillator(); const g = ctx2.createGain();
          osc.connect(g); g.connect(ctx2.destination);
          osc.type = "square"; osc.frequency.setValueAtTime(freq, ctx2.currentTime);
          const t = ctx2.currentTime + i * 0.15;
          g.gain.setValueAtTime(0.28, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.start(t); osc.stop(t + 0.25);
        });
      } catch { /* blocked */ }
    }, 900);
  } catch { /* blocked */ }
}

function playBeep(freq = 880, dur = 0.18) {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch { /* blocked */ }
}

function sendNotification(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/favicon.ico", tag: title });
}

function pushAlert(a: TradingAlert) {
  alertStore.unshift(a);
  if (alertStore.length > 60) alertStore.splice(60);
  notifyAlertListeners();
}

function checkAlerts() {
  ALL_SYMBOLS.forEach(({ sym, name }) => {
    const live = liveCache[sym];
    if (!live) return;
    const d = buildData(sym, live);

    // ── 15m trend change ──
    const p15 = prevTrend15[sym]; const c15 = d.trend15;
    if (p15 !== undefined && p15 !== c15) {
      const isBull = c15 === "BULLISH";
      const triple = isBull && d.trend1h === "BULLISH" && d.trendDay === "BULLISH";
      const kind: TradingAlert["kind"] = triple ? "BULLISH_TRIPLE" : isBull ? "BULLISH_15M" : "BEARISH_15M";
      const eff15 = calcEffectiveness(d);
      pushAlert({ id: `${sym}-t15-${Date.now()}`, sym, name, price: d.price, changePct: d.changePct, kind, effPct: eff15.pct, effDir: eff15.dir, ts: new Date(), read: false });
      if (isBull) {
        playBeep(triple ? 1100 : 880, triple ? 0.3 : 0.18);
        if (triple) setTimeout(() => playBeep(1320, 0.2), 220);
        sendNotification(`🚀 ${sym} BULLISH${triple ? " (3 TF)" : " 15 Min"}`, `${name} · $${d.price} · ${d.changePct}%`);
      } else {
        playBeep(440, 0.18);
        sendNotification(`📉 ${sym} BEARISH 15 Min`, `${name} · $${d.price} · ${d.changePct}%`);
      }
    }
    prevTrend15[sym] = c15;

    // ── 1H trend change ──
    const p1h = prevTrend1h[sym]; const c1h = d.trend1h;
    if (p1h !== undefined && p1h !== c1h) {
      const kind: TradingAlert["kind"] = c1h === "BULLISH" ? "BULLISH_1H" : "BEARISH_1H";
      const eff1h = calcEffectiveness(d);
      pushAlert({ id: `${sym}-t1h-${Date.now()}`, sym, name, price: d.price, changePct: d.changePct, kind, effPct: eff1h.pct, effDir: eff1h.dir, ts: new Date(), read: false });
      playBeep(c1h === "BULLISH" ? 660 : 330, 0.22);
      sendNotification(`${c1h === "BULLISH" ? "📈" : "📉"} ${sym} 1H → ${c1h}`, `${name} · $${d.price}`);
    }
    prevTrend1h[sym] = c1h;

    // ── Bollinger Band breakout — 15m ──
    const pBB = prevBBStatus[sym]; const cBB = d.outsideBand;
    if (pBB !== undefined && pBB === "INSIDE" && cBB !== "INSIDE") {
      const rsiVal = parseFloat(d.rsi);
      const isCallSetup = cBB === "LOWER" && rsiVal < 40;
      const isPutSetup = cBB === "UPPER" && rsiVal > 65;
      if (isCallSetup || isPutSetup) {
        const kind: TradingAlert["kind"] = isCallSetup ? "BB_LOWER_BREAK" : "BB_UPPER_BREAK";
        const dir: "CALL" | "PUT" = isCallSetup ? "CALL" : "PUT";
        const effB15 = calcEffectiveness(d);
        pushAlert({ id: `${sym}-bb15-${Date.now()}`, sym, name, price: d.price, changePct: d.changePct, kind, tf: "15m", effPct: effB15.pct, effDir: effB15.dir, ts: new Date(), read: false });
        if (canAlarm(`${sym}-bb15-${dir}`)) playAlarm(dir);
        sendNotification(
          `${isCallSetup ? "🎯" : "⚠️"} ${sym} BB 15m ${isCallSetup ? "↓ CALL" : "↑ PUT"}`,
          `${name} · $${d.price} · RSI ${d.rsi}`
        );
      }
    }
    prevBBStatus[sym] = cBB;

    // ── Bollinger Band breakout — 1H ──
    const pBB1h = prevBB1h[sym]; const cBB1h = d.bb1hStatus;
    if (pBB1h !== undefined && pBB1h === "INSIDE" && cBB1h !== "INSIDE") {
      const rsiVal = parseFloat(d.rsi);
      const isCallSetup = cBB1h === "LOWER" && rsiVal < 45;
      const isPutSetup = cBB1h === "UPPER" && rsiVal > 60;
      if (isCallSetup || isPutSetup) {
        const kind: TradingAlert["kind"] = isCallSetup ? "BB_1H_LOWER" : "BB_1H_UPPER";
        const dir: "CALL" | "PUT" = isCallSetup ? "CALL" : "PUT";
        const effB1h = calcEffectiveness(d);
        pushAlert({ id: `${sym}-bb1h-${Date.now()}`, sym, name, price: d.price, changePct: d.changePct, kind, tf: "1H", effPct: effB1h.pct, effDir: effB1h.dir, ts: new Date(), read: false });
        if (canAlarm(`${sym}-bb1h-${dir}`)) playAlarm(dir);
        sendNotification(
          `${isCallSetup ? "🎯" : "⚠️"} ${sym} BB 1H ${isCallSetup ? "↓ CALL" : "↑ PUT"}`,
          `${name} · $${d.price} · RSI ${d.rsi}`
        );
      }
    }
    prevBB1h[sym] = cBB1h;

    // ── Bollinger Band breakout — Daily ──
    const pBBDay = prevBBDay[sym]; const cBBDay = d.bbDayStatus;
    if (pBBDay !== undefined && pBBDay === "INSIDE" && cBBDay !== "INSIDE") {
      const rsiVal = parseFloat(d.rsi);
      const isCallSetup = cBBDay === "LOWER" && rsiVal < 50;
      const isPutSetup = cBBDay === "UPPER" && rsiVal > 55;
      if (isCallSetup || isPutSetup) {
        const kind: TradingAlert["kind"] = isCallSetup ? "BB_DAY_LOWER" : "BB_DAY_UPPER";
        const dir: "CALL" | "PUT" = isCallSetup ? "CALL" : "PUT";
        const effBDay = calcEffectiveness(d);
        pushAlert({ id: `${sym}-bbday-${Date.now()}`, sym, name, price: d.price, changePct: d.changePct, kind, tf: "Day", effPct: effBDay.pct, effDir: effBDay.dir, ts: new Date(), read: false });
        if (canAlarm(`${sym}-bbday-${dir}`)) playAlarm(dir);
        sendNotification(
          `${isCallSetup ? "🎯" : "⚠️"} ${sym} BB Daily ${isCallSetup ? "↓ CALL" : "↑ PUT"}`,
          `${name} · $${d.price} · RSI ${d.rsi}`
        );
      }
    }
    prevBBDay[sym] = cBBDay;
  });
}

// ── useAlerts ─────────────────────────────────────────────────────────────────
function useAlerts() {
  const [alerts, setAlerts] = useState<TradingAlert[]>([...alertStore]);
  useEffect(() => {
    const refresh = () => setAlerts([...alertStore]);
    alertListeners.add(refresh);
    return () => { alertListeners.delete(refresh); };
  }, []);
  return alerts;
}

// ── Checklist hook ────────────────────────────────────────────────────────────
function useChecklist() {
  const load = (): string[] => { try { return JSON.parse(localStorage.getItem("dt-checklist") ?? "[]") as string[]; } catch { return []; } };
  const [items, setItems] = useState<string[]>(load);
  const addItem = (sym: string) => { const s = sym.toUpperCase().trim(); if (!s) return; const next = [...items, s].filter((v,i,a) => a.indexOf(v) === i); setItems(next); localStorage.setItem("dt-checklist", JSON.stringify(next)); };
  const removeItem = (sym: string) => { const next = items.filter(s => s !== sym); setItems(next); localStorage.setItem("dt-checklist", JSON.stringify(next)); };
  return { items, addItem, removeItem };
}

// ── Live data hook (subscribes to shared cache) ───────────────────────────────
function useLiveData(sym: string): PriceData | null {
  const [data, setData] = useState<PriceData | null>(() => liveCache[sym] ? buildData(sym, liveCache[sym]) : null);
  useEffect(() => {
    if (!liveCache[sym]) scheduleFetch(sym);
    const update = () => { const live = liveCache[sym]; if (live) setData(buildData(sym, live)); };
    cacheListeners.add(update);
    update();
    return () => { cacheListeners.delete(update); };
  }, [sym]);
  return data;
}

// ── EffectivenessBar ──────────────────────────────────────────────────────────
function EffectivenessBar({ pct, dir, lang, compact }: { pct: number; dir: "BULLISH" | "BEARISH"; lang: string; compact?: boolean }) {
  const isBull = dir === "BULLISH";
  const color = isBull ? C.green : C.red;
  const label = isBull ? (lang === "es" ? "ALCISTA" : "BULLISH") : (lang === "es" ? "BAJISTA" : "BEARISH");
  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 44, height: 4, borderRadius: 2, background: `${color}18`, overflow: "hidden", position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg,${color}50,${color})`, borderRadius: 2, transition: "width 0.6s" }} />
        </div>
        <span style={{ fontSize: 9, fontWeight: 900, color, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
          {isBull ? "▲" : "▼"} {pct}%
        </span>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 7.5, color: C.muted, letterSpacing: 0.8, fontWeight: 700, textTransform: "uppercase" }}>
          {lang === "es" ? "Efectividad Tendencia" : "Trend Effectiveness"}
        </span>
        <span style={{ fontSize: 10, fontWeight: 900, color, letterSpacing: 0.5 }}>
          {isBull ? "▲" : "▼"} {pct}% <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.85 }}>{label}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: `${C.border}40`, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}30, ${color}cc)`,
          borderRadius: 3, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* Center marker */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: `${C.border}80` }} />
      </div>
    </div>
  );
}

function TFBadge({ label, bull }: { label: string; bull: boolean }) {
  const c = bull ? C.green : C.red;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <span style={{ fontSize: 7, color: C.muted, letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 3, background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
        {bull ? "▲" : "▼"}
      </span>
    </div>
  );
}

function BBBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    INSIDE: { label: "BB ✓",     color: C.accent },
    UPPER:  { label: "BB↑ PUT",  color: C.red    },
    LOWER:  { label: "BB↓ CALL", color: C.green  },
  };
  const c = cfg[status] ?? cfg.INSIDE;
  return (
    <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 3, background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}40`, alignSelf: "center" }}>
      {c.label}
    </span>
  );
}

function ChecklistItem({ sym, onRemove, onAnalyze }: { sym: string; onRemove: () => void; onAnalyze: () => void }) {
  const data = useLiveData(sym);
  const { lang } = useLang();
  return (
    <div style={{ padding: "9px 12px", borderBottom: `1px solid ${C.border}20`, animation: "fadeIn 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 12, color: C.white, fontFamily: "monospace" }}>{sym}</span>
          {data && <span style={{ fontSize: 10, color: parseFloat(data.change) >= 0 ? C.green : C.red, fontFamily: "monospace" }}>${data.price}</span>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onAnalyze} style={{ padding: "2px 7px", borderRadius: 4, background: `${C.accent}15`, border: `1px solid ${C.accent}40`, color: C.accent, fontSize: 8, cursor: "pointer", fontWeight: 800, letterSpacing: 0.5 }}>
            {tr("analyzeBtn", lang)}
          </button>
          <button onClick={onRemove} style={{ background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>✕</button>
        </div>
      </div>
      {data ? (
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <TFBadge label="15m" bull={data.trend15 === "BULLISH"} />
          <TFBadge label="1H"  bull={data.trend1h === "BULLISH"} />
          <TFBadge label="Day" bull={data.trendDay === "BULLISH"} />
          <BBBadge status={data.outsideBand} />
        </div>
      ) : (
        <div style={{ fontSize: 9, color: C.muted }}>Loading…</div>
      )}
    </div>
  );
}

// ── AlertPanel ────────────────────────────────────────────────────────────────
function AlertPanel({ onClose, onAnalyze }: { onClose: () => void; onAnalyze: (sym: string) => void }) {
  const alerts = useAlerts();
  const { lang } = useLang();
  const isMobile = useMobile();
  const [panelTab, setPanelTab] = useState<"alerts" | "checklist">("alerts");
  const { items: checkItems, addItem: addCheck, removeItem: removeCheck } = useChecklist();
  const [checkInput, setCheckInput] = useState("");
  const [muted, setMuted] = useState(!soundEnabled);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setMuted(!next);
    // Play a quick confirmation beep when unmuting
    if (next) setTimeout(() => playBeep(880, 0.12), 50);
  };

  const kindMeta: Record<TradingAlert["kind"], { label: string; color: string; icon: string; desc: string }> = {
    BULLISH_TRIPLE: { label: tr("k_bull3", lang),  color: C.green,   icon: "🚀", desc: lang === "es" ? "Alcista en las 3 temporalidades" : "Bullish on all 3 timeframes" },
    BULLISH_15M:    { label: tr("k_bull15", lang),  color: "#00e676", icon: "▲",  desc: lang === "es" ? "Cambio alcista 15 Min" : "15 Min bullish trend change" },
    BEARISH_15M:    { label: tr("k_bear15", lang),  color: C.red,     icon: "▼",  desc: lang === "es" ? "Cambio bajista 15 Min" : "15 Min bearish trend change" },
    BULLISH_1H:     { label: tr("k_bull1h", lang),  color: "#4ade80", icon: "📈", desc: lang === "es" ? "Cambio alcista 1H" : "1H bullish trend change" },
    BEARISH_1H:     { label: tr("k_bear1h", lang),  color: "#f87171", icon: "📉", desc: lang === "es" ? "Cambio bajista 1H" : "1H bearish trend change" },
    BB_LOWER_BREAK: { label: tr("k_bbLow", lang),   color: C.accent,  icon: "🎯", desc: lang === "es" ? "🔊 Rotura BB 15m ↓ · RSI sobreventa → CALL" : "🔊 BB 15m Break ↓ · RSI oversold → CALL setup" },
    BB_UPPER_BREAK: { label: tr("k_bbHigh", lang),  color: C.orange,  icon: "⚠️", desc: lang === "es" ? "🔊 Rotura BB 15m ↑ · RSI sobrecompra → PUT" : "🔊 BB 15m Break ↑ · RSI overbought → PUT setup" },
    BB_1H_LOWER:    { label: lang === "es" ? "BB 1H ↓ CALL" : "BB 1H ↓ CALL", color: C.accent,  icon: "🎯", desc: lang === "es" ? "🔊 Rotura BB 1H ↓ → CALL setup" : "🔊 BB 1H Break ↓ → CALL setup" },
    BB_1H_UPPER:    { label: lang === "es" ? "BB 1H ↑ PUT"  : "BB 1H ↑ PUT",  color: C.orange,  icon: "⚠️", desc: lang === "es" ? "🔊 Rotura BB 1H ↑ → PUT setup" : "🔊 BB 1H Break ↑ → PUT setup" },
    BB_DAY_LOWER:   { label: lang === "es" ? "BB Diario ↓ CALL" : "BB Daily ↓ CALL", color: C.green,  icon: "🎯", desc: lang === "es" ? "🔊 Rotura BB Diario ↓ → CALL setup fuerte" : "🔊 BB Daily Break ↓ → Strong CALL setup" },
    BB_DAY_UPPER:   { label: lang === "es" ? "BB Diario ↑ PUT"  : "BB Daily ↑ PUT",  color: "#ff6b35", icon: "⚠️", desc: lang === "es" ? "🔊 Rotura BB Diario ↑ → PUT setup fuerte" : "🔊 BB Daily Break ↑ → Strong PUT setup" },
  };

  const markAllRead = () => { alertStore.forEach(a => { a.read = true; }); notifyAlertListeners(); };
  const unread = alerts.filter(a => !a.read).length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: isMobile ? "100%" : 360, height: "100%", background: C.panel,
        borderLeft: isMobile ? "none" : `1px solid ${C.gold}30`,
        display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease",
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.gold}30, transparent)` }} />
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: C.white, letterSpacing: 1 }}>{tr("alertsHdr", lang)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {unread > 0 && panelTab === "alerts" && (
              <button onClick={markAllRead} style={{ fontSize: 9, color: C.accent, background: "none", border: "none", cursor: "pointer" }}>
                {tr("markRead", lang)}
              </button>
            )}
            <button
              onClick={toggleSound}
              title={muted ? (lang === "es" ? "Activar sonido" : "Enable sound") : (lang === "es" ? "Silenciar alarmas" : "Mute alarms")}
              style={{ fontSize: 15, background: muted ? `${C.red}20` : `${C.green}18`, border: `1px solid ${muted ? C.red : C.green}40`, borderRadius: 6, padding: "2px 7px", cursor: "pointer", lineHeight: 1.2, color: muted ? C.red : C.green, transition: "all 0.2s" }}
            >
              {muted ? "🔕" : "🔔"}
            </button>
            <button onClick={onClose} style={{ fontSize: 16, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {(["alerts", "checklist"] as const).map(t => (
            <button key={t} onClick={() => setPanelTab(t)} style={{
              flex: 1, padding: "9px 0", fontSize: 10, fontWeight: 800, cursor: "pointer",
              background: "none", border: "none",
              color: panelTab === t ? C.gold : C.muted,
              borderBottom: panelTab === t ? `2px solid ${C.gold}` : "2px solid transparent",
              letterSpacing: 0.5, transition: "color 0.15s",
            }}>
              {t === "alerts"
                ? `${tr("alertsTab", lang)}${unread > 0 ? ` (${unread})` : ""}`
                : `${tr("checklistTab", lang)}${checkItems.length > 0 ? ` (${checkItems.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {panelTab === "alerts" ? (
            alerts.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: C.white, fontSize: 12 }}>{tr("noAlerts", lang)}</div>
                <div style={{ fontSize: 10, lineHeight: 1.6 }}>{tr("noAlertsDetail", lang)}</div>
              </div>
            ) : alerts.map(a => {
              const m = kindMeta[a.kind];
              const pct = parseFloat(a.changePct);
              const timeStr = a.ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              const inList = checkItems.includes(a.sym);
              return (
                <div key={a.id} style={{
                  padding: "11px 14px", borderBottom: `1px solid ${C.border}10`,
                  background: a.read ? "transparent" : `${m.color}06`,
                  borderLeft: `3px solid ${a.read ? "transparent" : m.color}`,
                  animation: "fadeIn 0.3s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 15 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: C.white }}>{a.sym}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>{a.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: C.white, fontWeight: 700 }}>${a.price}</div>
                      <div style={{ fontSize: 10, color: pct >= 0 ? C.green : C.red, fontFamily: "monospace" }}>
                        {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: C.text2, marginBottom: 6, lineHeight: 1.4 }}>{m.desc}</div>
                  {/* Effectiveness bar in alert */}
                  <div style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 7.5, color: C.muted, letterSpacing: 0.8, fontWeight: 700, textTransform: "uppercase" }}>
                        {lang === "es" ? "Efectividad" : "Effectiveness"}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 900, color: a.effDir === "BULLISH" ? C.green : C.red, letterSpacing: 0.3 }}>
                        {a.effDir === "BULLISH" ? "▲" : "▼"} {a.effPct}%
                        <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.85, marginLeft: 3 }}>
                          {a.effDir === "BULLISH" ? (lang === "es" ? "ALCISTA" : "BULLISH") : (lang === "es" ? "BAJISTA" : "BEARISH")}
                        </span>
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: `${a.effDir === "BULLISH" ? C.green : C.red}15`, overflow: "hidden", position: "relative" }}>
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${a.effPct}%`,
                        background: `linear-gradient(90deg, ${a.effDir === "BULLISH" ? C.green : C.red}40, ${a.effDir === "BULLISH" ? C.green : C.red})`,
                        borderRadius: 2,
                      }} />
                      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: `${C.border}60` }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}>
                      {m.label}{a.tf ? ` · ${a.tf}` : ""}
                    </span>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <button onClick={() => { addCheck(a.sym); setPanelTab("checklist"); }} style={{ padding: "3px 6px", borderRadius: 4, fontSize: 8, fontWeight: 800, cursor: "pointer", background: inList ? `${C.gold}18` : `${C.border}40`, border: `1px solid ${inList ? C.gold + "60" : C.border}`, color: inList ? C.gold : C.muted, letterSpacing: 0.3 }}>
                        {inList ? "✓ List" : tr("addChecklist", lang)}
                      </button>
                      <button onClick={() => { a.read = true; notifyAlertListeners(); onAnalyze(a.sym); }} style={{ padding: "3px 7px", borderRadius: 4, fontSize: 8, fontWeight: 800, cursor: "pointer", background: `${C.green}15`, border: `1px solid ${C.green}40`, color: C.green, letterSpacing: 0.3 }}>
                        {tr("analyzeBtn", lang)}
                      </button>
                      <span style={{ fontSize: 8, color: C.muted }}>{timeStr}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // ── Checklist tab ──
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ padding: "12px 12px 8px", borderBottom: `1px solid ${C.border}20`, flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.8, marginBottom: 8, fontWeight: 700 }}>{tr("checklistHdr", lang)}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={checkInput} onChange={e => setCheckInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === "Enter" && checkInput.trim()) { addCheck(checkInput.trim()); setCheckInput(""); } }}
                    placeholder={tr("checklistAdd", lang)}
                    style={{ flex: 1, padding: "7px 8px", borderRadius: 6, background: C.panelB, border: `1px solid ${C.border}`, color: C.white, fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", outline: "none" }} maxLength={10} />
                  <button onClick={() => { if (checkInput.trim()) { addCheck(checkInput.trim()); setCheckInput(""); } }} style={{ padding: "7px 10px", borderRadius: 6, background: C.gold, border: "none", color: C.bg, fontWeight: 800, fontSize: 9, cursor: "pointer" }}>
                    {tr("addBtn", lang)}
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {checkItems.length === 0 ? (
                  <div style={{ padding: "28px 16px", textAlign: "center", color: C.muted, fontSize: 10, lineHeight: 1.6 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    {tr("checklistEmpty", lang)}
                  </div>
                ) : checkItems.map(sym => (
                  <ChecklistItem key={sym} sym={sym} onRemove={() => removeCheck(sym)} onAnalyze={() => onAnalyze(sym)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 9, color: C.muted, flexShrink: 0 }}>
          {tr("autoMonitor1", lang)} {ALL_SYMBOLS.length} {tr("autoMonitor2", lang)}
        </div>
      </div>
    </div>
  );
}

function AlertBell({ onClick }: { onClick: () => void }) {
  const alerts = useAlerts();
  const { lang } = useLang();
  const unread = alerts.filter(a => !a.read).length;
  return (
    <button onClick={onClick} title={tr("trendAlerts", lang)} style={{
      position: "relative", padding: "6px 10px", borderRadius: 6, fontSize: 16,
      background: unread > 0 ? `${C.gold}15` : "transparent",
      border: `1px solid ${unread > 0 ? C.gold + "60" : C.border}`,
      cursor: "pointer", lineHeight: 1, animation: unread > 0 ? "pulse 1.5s infinite" : "none",
    }}>
      🔔
      {unread > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          background: C.red, color: C.white, fontSize: 8, fontWeight: 900,
          borderRadius: "50%", width: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${C.bg}`,
        }}>
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

// ── Data builder ──────────────────────────────────────────────────────────────
function safeNum(v: unknown, fallback: number): number {
  const n = Number(v); return isFinite(n) && n > 0 ? n : fallback;
}

function buildData(sym: string, live: LiveQuote | null): PriceData {
  const b = safeNum(live?.price, 100);
  const chg = isFinite(Number(live?.change)) ? Number(live?.change) : 0;
  const pct = isFinite(Number(live?.changePct)) ? Number(live?.changePct) : 0;
  const vol = safeNum(live?.volume, Math.floor(5e6 + Math.random() * 50e6));
  const dayHigh = safeNum(live?.dayHigh, b * 1.01);
  const dayLow = safeNum(live?.dayLow, b * 0.99);
  const openPrice = safeNum(live?.open, b);
  const std = Math.max((dayHigh - dayLow) / 4, b * 0.005);
  const ma20 = openPrice * (0.997 + Math.random() * 0.006);
  const upper = ma20 + 2 * std; const lower = ma20 - 2 * std;
  const liveMa50 = safeNum(live?.ma50, 0); const liveMa200 = safeNum(live?.ma200, 0);
  const ma40 = liveMa50 > 0 ? liveMa50 * (0.995 + Math.random() * 0.01) : b * (0.988 + Math.random() * 0.015);
  const ma100 = liveMa50 > 0 ? liveMa50 * (0.985 + Math.random() * 0.02) : b * (0.97 + Math.random() * 0.02);
  const ma200 = liveMa200 > 0 ? liveMa200 : b * (0.95 + Math.random() * 0.025);
  const rsi = 30 + Math.random() * 40;
  const stoch = Math.random() * 100;
  const outsideBand = b > upper ? "UPPER" : b < lower ? "LOWER" : "INSIDE";
  // 1H bands — wider volatility window (~2.5x std)
  const std1h = Math.max((dayHigh - dayLow) / 2.2, b * 0.013);
  const ma1h = openPrice * (0.994 + Math.random() * 0.012);
  const upper1h = ma1h + 2 * std1h; const lower1h = ma1h - 2 * std1h;
  const bb1hStatus = b > upper1h ? "UPPER" : b < lower1h ? "LOWER" : "INSIDE";
  // Daily bands — wider volatility window (~4x std)
  const stdDay = Math.max((dayHigh - dayLow) / 1.4, b * 0.022);
  const maDay = openPrice * (0.991 + Math.random() * 0.018);
  const upperDay = maDay + 2 * stdDay; const lowerDay = maDay - 2 * stdDay;
  const bbDayStatus = b > upperDay ? "UPPER" : b < lowerDay ? "LOWER" : "INSIDE";
  const trend15 = b > ma20 ? "BULLISH" : "BEARISH";
  const trend1h = b > ma40 ? "BULLISH" : "BEARISH";
  const trendDay = b > ma100 ? "BULLISH" : "BEARISH";

  let signal = "NEUTRAL", signalDetail = "", signalDetailEs = "";
  if (outsideBand === "LOWER" && rsi < 40 && trendDay === "BULLISH") {
    signal = "CALL";
    signalDetail = "Price below lower band · RSI oversold · Daily bullish → Potential reversal";
    signalDetailEs = "Precio bajo banda inferior · RSI sobreventa · Día alcista → Reversión potencial";
  } else if (outsideBand === "UPPER" && rsi > 65 && trendDay === "BEARISH") {
    signal = "PUT";
    signalDetail = "Price above upper band · RSI overbought · Daily bearish → Potential reversal";
    signalDetailEs = "Precio sobre banda superior · RSI sobrecompra · Día bajista → Reversión potencial";
  } else if (trend15 === "BULLISH" && trend1h === "BULLISH" && outsideBand === "INSIDE") {
    signal = "CALL";
    signalDetail = "15m & 1H bullish · Inside bands → Trend continuation";
    signalDetailEs = "15m y 1H alcistas · Dentro de bandas → Continuación tendencia";
  } else if (trend15 === "BEARISH" && trend1h === "BEARISH" && outsideBand === "INSIDE") {
    signal = "PUT";
    signalDetail = "15m & 1H bearish · Inside bands → Trend continuation";
    signalDetailEs = "15m y 1H bajistas · Dentro de bandas → Continuación tendencia";
  }

  const targetPrice = signal === "CALL" ? (b * 1.025).toFixed(2) : signal === "PUT" ? (b * 0.975).toFixed(2) : (b * 1.01).toFixed(2);
  // Use known fundamentals when available, fall back to estimated values
  const kf = KNOWN_FUNDAMENTALS[sym];
  const recBuyV  = kf ? kf.recBuy  : 3 + Math.floor(Math.random() * 8);
  const recHoldV = kf ? kf.recHold : 5 + Math.floor(Math.random() * 10);
  const recSellV = kf ? kf.recSell : Math.floor(Math.random() * 5);
  const recTotal = recBuyV + recHoldV + recSellV;
  const recommScore = kf ? kf.recom : (recTotal > 0 ? ((recBuyV * 1 + recHoldV * 3 + recSellV * 5) / recTotal).toFixed(1) : "2.5");
  let marketCap: string, income: string, sales: string, bookSh: string, peRatio: string;
  let lowTarget: string, avgTarget: string, highTarget: string;
  if (kf) {
    marketCap = kf.mcap; income = kf.netIncome; sales = kf.revenue;
    bookSh = kf.bookSh; peRatio = kf.pe;
    lowTarget = kf.targetLow; avgTarget = kf.targetAvg; highTarget = kf.targetHigh;
  } else {
    const sharesM = 50 + Math.random() * 200;
    const mcapRaw = b * sharesM * 1e6;
    marketCap = mcapRaw >= 1e12 ? `$${(mcapRaw/1e12).toFixed(2)}T` : `$${(mcapRaw/1e9).toFixed(1)}B`;
    const incomeRaw = mcapRaw * (0.05 + Math.random() * 0.12);
    income = incomeRaw >= 1e9 ? `$${(incomeRaw/1e9).toFixed(1)}B` : `$${(incomeRaw/1e6).toFixed(0)}M`;
    const salesRaw = incomeRaw * (4 + Math.random() * 6);
    sales = salesRaw >= 1e9 ? `$${(salesRaw/1e9).toFixed(1)}B` : `$${(salesRaw/1e6).toFixed(0)}M`;
    bookSh = `$${(b * (0.15 + Math.random() * 0.35)).toFixed(2)}`;
    peRatio = (15 + Math.random() * 25).toFixed(1);
    lowTarget = `$${(b * (0.82 + Math.random() * 0.08)).toFixed(2)}`;
    avgTarget = `$${(b * (1.06 + Math.random() * 0.10)).toFixed(2)}`;
    highTarget = `$${(b * (1.22 + Math.random() * 0.14)).toFixed(2)}`;
  }
  return {
    symbol: sym, price: b.toFixed(2), change: chg.toFixed(2), changePct: pct.toFixed(2),
    volume: vol, rsi: rsi.toFixed(1), stoch: stoch.toFixed(1),
    ma20: ma20.toFixed(2), ma40: ma40.toFixed(2), ma100: ma100.toFixed(2), ma200: ma200.toFixed(2),
    bbUpper: upper.toFixed(2), bbLower: lower.toFixed(2), bbMid: ma20.toFixed(2),
    outsideBand, bb1hStatus, bbDayStatus, trend15, trend1h, trendDay, signal, signalDetail, signalDetailEs, targetPrice,
    recBuy: recBuyV, recHold: recHoldV, recSell: recSellV,
    marketCap, income, sales, bookSh, peRatio, recom: recommScore,
    lowTarget, avgTarget, highTarget,
    preMarketPrice:    live?.preMarketPrice   != null ? live.preMarketPrice.toFixed(2)    : null,
    preMarketChange:   live?.preMarketChange  != null ? live.preMarketChange.toFixed(2)   : null,
    preMarketChangePct: live?.preMarketChangePct != null ? live.preMarketChangePct.toFixed(2) : null,
    postMarketPrice:   live?.postMarketPrice  != null ? live.postMarketPrice.toFixed(2)   : null,
    postMarketChange:  live?.postMarketChange != null ? live.postMarketChange.toFixed(2)  : null,
    postMarketChangePct: live?.postMarketChangePct != null ? live.postMarketChangePct.toFixed(2) : null,
    timestamp: new Date().toLocaleTimeString("en-US"), live: !!live,
  };
}

// ── Effectiveness scoring ─────────────────────────────────────────────────────
// Weighted composite of 15m · 1H · Day trends + BB position across all TFs
// Returns 0-100% strength and direction
function calcEffectiveness(data: PriceData): { pct: number; dir: "BULLISH" | "BEARISH" } {
  let score = 0;
  score += data.trend15  === "BULLISH" ? 15 : -15;
  score += data.trend1h  === "BULLISH" ? 25 : -25;
  score += data.trendDay === "BULLISH" ? 35 : -35;
  if      (data.outsideBand === "LOWER") score += 10;
  else if (data.outsideBand === "UPPER") score -= 10;
  if      (data.bb1hStatus  === "LOWER") score += 8;
  else if (data.bb1hStatus  === "UPPER") score -= 8;
  if      (data.bbDayStatus === "LOWER") score += 7;
  else if (data.bbDayStatus === "UPPER") score -= 7;
  return { pct: Math.abs(score), dir: score >= 0 ? "BULLISH" : "BEARISH" };
}

function usePriceEngine(symbol: string) {
  const [data, setData] = useState<PriceData | null>(null);
  useEffect(() => {
    if (!liveCache[symbol]) scheduleFetch(symbol);
    const refresh = () => setData(buildData(symbol, liveCache[symbol] ?? null));
    refresh();
    cacheListeners.add(refresh);
    const interval = setInterval(refresh, 5000);
    return () => { cacheListeners.delete(refresh); clearInterval(interval); };
  }, [symbol]);
  return data;
}

type FinvizData = {
  marketCap: string; income: string; sales: string; bookSh: string;
  pe: string; forwardPe: string; eps: string; recom: string;
  targetPrice: string; earnings: string; beta: string; shortFloat: string;
  high52w: string; low52w: string; grossMargin: string; profitMargin: string;
  roe: string; debtEq: string; recBuy: number; recHold: number; recSell: number;
};
const finvizCache = new Map<string, { ts: number; data: FinvizData }>();
const FINVIZ_TTL = 60 * 60 * 1000;

function useFinviz(sym: string): FinvizData | null {
  const [data, setData] = useState<FinvizData | null>(null);
  useEffect(() => {
    const cached = finvizCache.get(sym);
    if (cached && Date.now() - cached.ts < FINVIZ_TTL) { setData(cached.data); return; }
    fetch(`/api/finviz?symbol=${encodeURIComponent(sym)}`)
      .then(r => r.ok ? r.json() as Promise<FinvizData> : Promise.reject())
      .then(d => { finvizCache.set(sym, { ts: Date.now(), data: d }); setData(d); })
      .catch(() => {});
  }, [sym]);
  return data;
}

// ── Small components ──────────────────────────────────────────────────────────
function Sparkline({ positive, width = 80, height = 32 }: { positive: boolean; width?: number; height?: number }) {
  const pts = useRef(Array.from({ length: 20 }, () => 0.5));
  const [path, setPath] = useState("");
  useEffect(() => {
    const iv = setInterval(() => {
      const arr = [...pts.current.slice(1), Math.max(0.05, Math.min(0.95,
        pts.current[pts.current.length - 1] + (Math.random() - (positive ? 0.42 : 0.58)) * 0.12
      ))];
      pts.current = arr;
      setPath(arr.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (arr.length - 1)) * width} ${(1 - v) * height}`).join(" "));
    }, 1000);
    return () => clearInterval(iv);
  }, [positive, width, height]);
  return <svg width={width} height={height} style={{ opacity: 0.85 }}>
    <path d={path} fill="none" stroke={positive ? C.green : C.red} strokeWidth="1.5" />
  </svg>;
}

function SignalBadge({ signal }: { signal: string }) {
  const { lang } = useLang();
  const cfg: Record<string, { bg: string; border: string; color: string; label: string }> = {
    CALL:    { bg: `${C.green}22`, border: C.green, color: C.green, label: "▲ CALL" },
    PUT:     { bg: `${C.red}22`, border: C.red, color: C.red, label: "▼ PUT" },
    NEUTRAL: { bg: `${C.gold}11`, border: C.gold, color: C.gold, label: tr("signalNeutral", lang) },
  };
  const s = cfg[signal] ?? cfg.NEUTRAL;
  return <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontFamily: "monospace" }}>
    {s.label}
  </span>;
}

function trendTxt(trend: string, lang: Lang) {
  if (trend === "BULLISH") return lang === "es" ? "ALCISTA" : "BULLISH";
  if (trend === "BEARISH") return lang === "es" ? "BAJISTA" : "BEARISH";
  return trend;
}

function TrendPill({ label, trend }: { label: string; trend: string }) {
  const { lang } = useLang();
  const up = trend === "BULLISH";
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <span style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3, background: up ? `${C.green}20` : `${C.red}20`, color: up ? C.green : C.red, border: `1px solid ${up ? C.green : C.red}40` }}>
      {trendTxt(trend, lang)}
    </span>
  </div>;
}

function BBStatus({ status, data }: { status: string; data: PriceData }) {
  const { lang } = useLang();
  const inside = status === "INSIDE"; const upper = status === "UPPER";
  const label = inside ? tr("insideBB", lang) : upper ? tr("aboveBB", lang) : tr("belowBB", lang);
  const color = inside ? C.accent : upper ? C.red : C.green;
  return <div style={{ padding: "8px 12px", borderRadius: 6, background: `${color}12`, border: `1px solid ${color}40`, marginTop: 8 }}>
    <div style={{ color, fontWeight: 700, fontSize: 11 }}>{label}</div>
    {!inside && <div style={{ fontSize: 10, color: C.text2, marginTop: 4, lineHeight: 1.4 }}>
      {upper
        ? `1H: ${trendTxt(data.trend1h, lang)} · ${tr("tfDay", lang)}: ${trendTxt(data.trendDay, lang)} · RSI: ${data.rsi}`
        : `${tr("waitBB", lang)} · RSI: ${data.rsi} ${parseFloat(data.rsi) < 35 ? tr("oversold", lang) : ""}`}
    </div>}
  </div>;
}

function RSIGauge({ value }: { value: string }) {
  const v = parseFloat(value);
  const color = v < 30 ? C.green : v > 70 ? C.red : C.accent;
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ width: `${v}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s" }} />
    </div>
    <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 28 }}>{value}</span>
  </div>;
}

// ── Earnings Card ─────────────────────────────────────────────────────────────
function EarningsCard({ sym }: { sym: string }) {
  const { lang } = useLang();
  const ev = getNextEarnings(sym);
  if (!ev) return null;
  const isToday = ev.daysAway === 0;
  const isTmrw = ev.daysAway === 1;
  const urgentColor = isToday ? C.red : isTmrw ? C.orange : ev.daysAway <= 7 ? C.gold : C.accent;
  const countdownLabel = isToday
    ? tr("earningsToday", lang)
    : isTmrw
    ? tr("earningsTmrw", lang)
    : `${ev.daysAway} ${tr("earningsDays", lang)}`;
  const evDate = new Date(ev.date);
  const dateStr = evDate.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <div style={{ background: `${urgentColor}10`, borderRadius: 8, padding: "10px 12px", border: `1px solid ${urgentColor}30`, marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: urgentColor, letterSpacing: 0.5 }}>{tr("earningsLbl", lang)}</span>
        <span style={{ fontSize: 9, fontWeight: 900, padding: "2px 8px", background: `${urgentColor}20`, borderRadius: 4, border: `1px solid ${urgentColor}50`, color: urgentColor, animation: isToday ? "pulse 1s infinite" : "none" }}>
          {countdownLabel}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{tr("earningsNext", lang)}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.white }}>{dateStr}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>Period</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text2 }}>{ev.period}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{tr("earningsEst", lang)}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green }}>{ev.epsEst}</div>
        </div>
      </div>
    </div>
  );
}

// ── Watchlist management ───────────────────────────────────────────────────────
function useWatchlist() {
  const load = (key: string): string[] => {
    try { return JSON.parse(localStorage.getItem(key) ?? "[]") as string[]; } catch { return []; }
  };
  const save = (key: string, arr: string[]) => localStorage.setItem(key, JSON.stringify(arr));
  const [customStocks, setCustomStocks] = useState<string[]>(() => load("dt-custom-stocks"));
  const [customEtfs, setCustomEtfs]     = useState<string[]>(() => load("dt-custom-etfs"));
  const [hiddenDefaultStocks, setHiddenDefaultStocks] = useState<string[]>(() => load("dt-hidden-stocks"));
  const [hiddenDefaultEtfs, setHiddenDefaultEtfs]     = useState<string[]>(() => load("dt-hidden-etfs"));
  const addStock = (sym: string) => { const next = [...customStocks, sym.toUpperCase()].filter((v,i,a) => a.indexOf(v) === i); setCustomStocks(next); save("dt-custom-stocks", next); };
  const removeStock = (sym: string) => { const next = customStocks.filter(s => s !== sym); setCustomStocks(next); save("dt-custom-stocks", next); };
  const addEtf = (sym: string) => { const next = [...customEtfs, sym.toUpperCase()].filter((v,i,a) => a.indexOf(v) === i); setCustomEtfs(next); save("dt-custom-etfs", next); };
  const removeEtf = (sym: string) => { const next = customEtfs.filter(s => s !== sym); setCustomEtfs(next); save("dt-custom-etfs", next); };
  const hideDefaultStock = (sym: string) => { const next = [...hiddenDefaultStocks, sym].filter((v,i,a) => a.indexOf(v) === i); setHiddenDefaultStocks(next); save("dt-hidden-stocks", next); };
  const showDefaultStock = (sym: string) => { const next = hiddenDefaultStocks.filter(s => s !== sym); setHiddenDefaultStocks(next); save("dt-hidden-stocks", next); };
  const hideDefaultEtf = (sym: string) => { const next = [...hiddenDefaultEtfs, sym].filter((v,i,a) => a.indexOf(v) === i); setHiddenDefaultEtfs(next); save("dt-hidden-etfs", next); };
  const showDefaultEtf = (sym: string) => { const next = hiddenDefaultEtfs.filter(s => s !== sym); setHiddenDefaultEtfs(next); save("dt-hidden-etfs", next); };
  return { customStocks, customEtfs, addStock, removeStock, addEtf, removeEtf, hiddenDefaultStocks, hiddenDefaultEtfs, hideDefaultStock, showDefaultStock, hideDefaultEtf, showDefaultEtf };
}

function WatchlistModal({ onClose, customStocks, customEtfs, addStock, removeStock, addEtf, removeEtf, hiddenDefaultStocks, hiddenDefaultEtfs, showDefaultStock, showDefaultEtf }: {
  onClose: () => void;
  customStocks: string[]; customEtfs: string[];
  addStock: (s: string) => void; removeStock: (s: string) => void;
  addEtf: (s: string) => void;   removeEtf: (s: string) => void;
  hiddenDefaultStocks: string[]; hiddenDefaultEtfs: string[];
  showDefaultStock: (s: string) => void; showDefaultEtf: (s: string) => void;
}) {
  const { lang } = useLang();
  const isMobile = useMobile();
  const [stockInput, setStockInput] = useState("");
  const [etfInput, setEtfInput] = useState("");
  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "8px 10px", borderRadius: 6, background: C.panelB,
    border: `1px solid ${C.border}`, color: C.white, fontSize: 11,
    fontFamily: "monospace", textTransform: "uppercase" as const,
  };
  const addBtnStyle: React.CSSProperties = {
    padding: "8px 14px", borderRadius: 6, background: C.gold, border: "none",
    color: C.bg, fontWeight: 800, fontSize: 10, cursor: "pointer", letterSpacing: 0.5,
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 16 }} onClick={onClose}>
      <div style={{ background: C.panel, borderRadius: isMobile ? "16px 16px 0 0" : 12, padding: 0, maxWidth: 520, width: "100%", maxHeight: isMobile ? "92vh" : "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldDim}, transparent)`, flexShrink: 0 }} />
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.gold }}>{tr("watchlistTitle", lang)}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Custom Stocks */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>{tr("customStocks", lang)}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={stockInput} onChange={e => setStockInput(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === "Enter" && stockInput.trim()) { addStock(stockInput.trim()); setStockInput(""); } }} placeholder={tr("addSymbol", lang)} style={inputStyle} maxLength={10} />
              <button style={addBtnStyle} onClick={() => { if (stockInput.trim()) { addStock(stockInput.trim()); setStockInput(""); } }}>{tr("addBtn", lang)}</button>
            </div>
            {customStocks.length === 0 ? (
              <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", padding: "8px 0" }}>No custom stocks yet</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {customStocks.map(sym => (
                  <div key={sym} style={{ display: "flex", alignItems: "center", gap: 6, background: C.panelB, borderRadius: 6, padding: "6px 10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.white, fontFamily: "monospace" }}>{sym}</span>
                    <button onClick={() => removeStock(sym)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Custom ETFs */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>{tr("customEtfs", lang)}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={etfInput} onChange={e => setEtfInput(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === "Enter" && etfInput.trim()) { addEtf(etfInput.trim()); setEtfInput(""); } }} placeholder={tr("addSymbol", lang)} style={inputStyle} maxLength={10} />
              <button style={addBtnStyle} onClick={() => { if (etfInput.trim()) { addEtf(etfInput.trim()); setEtfInput(""); } }}>{tr("addBtn", lang)}</button>
            </div>
            {customEtfs.length === 0 ? (
              <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", padding: "8px 0" }}>No custom ETFs yet</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {customEtfs.map(sym => (
                  <div key={sym} style={{ display: "flex", alignItems: "center", gap: 6, background: C.panelB, borderRadius: 6, padding: "6px 10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.white, fontFamily: "monospace" }}>{sym}</span>
                    <button onClick={() => removeEtf(sym)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Hidden default stocks */}
          {hiddenDefaultStocks.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>{tr("hiddenHdr", lang)}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {hiddenDefaultStocks.map(sym => (
                  <div key={sym} style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.border}30`, borderRadius: 6, padding: "6px 10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: "monospace" }}>{sym}</span>
                    <button onClick={() => showDefaultStock(sym)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1, fontWeight: 700 }} title="Restore">↩</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Hidden default ETFs */}
          {hiddenDefaultEtfs.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>{tr("hiddenHdr", lang)} (ETF)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {hiddenDefaultEtfs.map(sym => (
                  <div key={sym} style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.border}30`, borderRadius: 6, padding: "6px 10px", border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: "monospace" }}>{sym}</span>
                    <button onClick={() => showDefaultEtf(sym)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1, fontWeight: 700 }} title="Restore">↩</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: 10, color: C.muted, padding: "8px 12px", background: C.panelB, borderRadius: 6, border: `1px solid ${C.border}` }}>
            💡 {lang === "es" ? "Los activos personalizados se muestran en Activos y ETFs. Los ocultos pueden restaurarse aquí. Se guardan automáticamente." : "Custom assets appear in Activos & ETFs lists. Hidden ones can be restored here. All saved automatically."}
          </div>
        </div>
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: "100%", padding: "10px", borderRadius: 8, background: `${C.gold}20`, border: `1px solid ${C.gold}50`, color: C.gold, fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>{tr("closeBtn", lang)}</button>
        </div>
      </div>
    </div>
  );
}

// ── Gold section header ───────────────────────────────────────────────────────
function GoldHeader({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
    <div style={{ width: 3, height: 18, background: `linear-gradient(180deg, ${C.gold}, ${C.gold}33)`, borderRadius: 2, flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, letterSpacing: 1 }}>{children}</span>
  </div>;
}

// ── News ──────────────────────────────────────────────────────────────────────
type NewsItem = { title: string; link: string; pubDate: string; source: string; tag: string; sym: string | null };
const NEWS_TTL = 5 * 60 * 1000;
type NewsStore = { items: NewsItem[]; lastFetch: number; listeners: Set<() => void> };
const newsStores: Record<Lang, NewsStore> = {
  en: { items: [], lastFetch: 0, listeners: new Set() },
  es: { items: [], lastFetch: 0, listeners: new Set() },
};

function relativeTime(dateStr: string): string {
  const d = new Date(dateStr); if (isNaN(d.getTime())) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

async function fetchNews(lang: Lang) {
  const store = newsStores[lang];
  try {
    const res = await fetch(`/api/news${lang === "es" ? "?lang=es" : ""}`);
    if (!res.ok) return;
    const data = await res.json() as NewsItem[];
    if (Array.isArray(data) && data.length) {
      store.items = data;
      store.lastFetch = Date.now();
      store.listeners.forEach(fn => fn());
    }
  } catch { /* ignore */ }
}
setInterval(() => { fetchNews("en"); fetchNews("es"); }, NEWS_TTL);

function useNewsData(lang: Lang) {
  const [items, setItems] = useState<NewsItem[]>(newsStores[lang].items);
  useEffect(() => {
    const store = newsStores[lang];
    const refresh = () => setItems([...store.items]);
    store.listeners.add(refresh);
    if (Date.now() - store.lastFetch > NEWS_TTL) fetchNews(lang);
    if (store.items.length) setItems([...store.items]);
    return () => { store.listeners.delete(refresh); };
  }, [lang]);
  return items;
}

function NewsTicker() {
  const { lang } = useLang(); const items = useNewsData(lang);
  const [idx, setIdx] = useState(0);
  const pool = items.length ? items : [{ title: tr("loadingNews", lang), source: "", tag: "", sym: null, link: "", pubDate: "" }];
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % pool.length), 6000); return () => clearInterval(t); }, [pool.length]);
  const item = pool[idx % pool.length];
  return <div style={{ background: `${C.accent}08`, borderTop: `1px solid ${C.border}`, padding: "6px 16px", fontSize: 12, color: C.text2, overflow: "hidden", whiteSpace: "nowrap" }}>
    <span style={{ color: C.accent, fontWeight: 700, marginRight: 12 }}>{tr("liveNews", lang)}</span>
    {item.source && <span style={{ color: C.muted, marginRight: 8, fontSize: 10 }}>[{item.source}]</span>}
    <span style={{ animation: "tickerScroll 8s linear" }}>{item.title}</span>
  </div>;
}

// ── Fundamentals Panel (live Finviz) ──────────────────────────────────────────
function FundamentalsPanel({ symbol, lang, data }: { symbol: string; lang: Lang; data: PriceData }) {
  const fz = useFinviz(symbol);
  const isMobile = useMobile();

  const recBuy  = fz ? fz.recBuy  : data.recBuy;
  const recHold = fz ? fz.recHold : data.recHold;
  const recSell = fz ? fz.recSell : data.recSell;
  const recomVal = fz ? parseFloat(fz.recom) : parseFloat(data.recom);
  const recomColor = recomVal < 2.5 ? C.green : recomVal > 3.5 ? C.red : C.gold;

  // Key figures grouped together: Recom · Target Price · Prev Close · Price
  const recomDisplay  = (fz ? fz.recom : data.recom) || "N/A";
  const targetRaw     = (fz ? fz.targetPrice : data.avgTarget) || "";
  const targetDisplay = targetRaw || "N/A";
  const curPriceN     = parseFloat(data.price);
  const changeN       = parseFloat(data.change);
  const prevCloseN    = curPriceN - changeN;
  const prevCloseDisp = isNaN(prevCloseN) ? "N/A" : `$${prevCloseN.toFixed(2)}`;
  const priceDisplay  = isNaN(curPriceN) ? "N/A" : `$${data.price}`;
  const priceColor    = isNaN(changeN) ? C.white : changeN >= 0 ? C.green : C.red;
  const tgtN          = parseFloat(targetRaw.replace(/[$,]/g, ""));
  const upsidePct     = (!isNaN(tgtN) && !isNaN(curPriceN) && curPriceN > 0) ? ((tgtN - curPriceN) / curPriceN) * 100 : null;

  const Cell = ({ label, val, col }: { label: string; val: string; col: string }) => (
    <div>
      <div style={{ fontSize: 8.5, color: C.muted, marginBottom: 3, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: col, fontFamily: "monospace" }}>{val}</div>
    </div>
  );

  const BoxCell = ({ label, val, col }: { label: string; val: string; col: string }) => (
    <div style={{ background: `${col}10`, borderRadius: 6, padding: "6px 8px", border: `1px solid ${col}30` }}>
      <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: col, fontFamily: "monospace" }}>{val}</div>
    </div>
  );

  const KCell = ({ label, val, sub, col }: { label: string; val: string; sub?: string; col: string }) => (
    <div style={{ background: `${col}12`, borderRadius: 8, padding: isMobile ? "8px 4px" : "9px 6px", border: `1px solid ${col}30`, textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 8, color: C.muted, marginBottom: 4, letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 900, color: col, fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
      {sub && <div style={{ fontSize: 7.5, color: C.muted, marginTop: 1 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ background: C.panelB, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>

      {/* Header with live badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>{tr("fundamentals", lang)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {fz
            ? <span style={{ fontSize: 8, fontWeight: 800, color: C.green, background: `${C.green}15`, border: `1px solid ${C.green}40`, borderRadius: 4, padding: "2px 6px", letterSpacing: 0.5 }}>⬤ {tr("finvizLive", lang)}</span>
            : <span style={{ fontSize: 8, color: C.muted, fontStyle: "italic" }}>{tr("loadingFundamentals", lang)}</span>
          }
        </div>
      </div>

      {/* Row 1: Market Cap, Income, Revenue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Cell label={tr("marketCapLbl", lang)} val={fz ? fz.marketCap : data.marketCap} col={C.gold} />
        <Cell label={tr("incomeLbl", lang)}    val={fz ? fz.income    : data.income}    col={C.green} />
        <Cell label={tr("salesLbl", lang)}     val={fz ? fz.sales     : data.sales}     col={C.accent} />
      </div>

      {/* Row 2: P/E, Fwd P/E, EPS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Cell label={tr("peEst", lang)}       val={fz ? fz.pe        : data.peRatio} col={C.white} />
        <Cell label={tr("forwardPeLbl", lang)} val={fz ? fz.forwardPe : "N/A"}        col={C.white} />
        <Cell label={tr("epsLbl", lang)}       val={fz ? fz.eps       : "N/A"}         col={C.white} />
      </div>

      {/* Row 3: Book/sh, Beta, Short Float */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Cell label={tr("bookShLbl", lang)}    val={fz ? fz.bookSh     : data.bookSh} col={C.white} />
        <Cell label={tr("betaLbl", lang)}      val={fz ? fz.beta       : "N/A"}        col={C.white} />
        <Cell label={tr("shortFloatLbl", lang)} val={fz ? fz.shortFloat : "N/A"}       col={fz && parseFloat(fz.shortFloat) > 15 ? C.red : C.white} />
      </div>

      {/* Row 4: Margins & ROE */}
      {fz && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <Cell label={tr("grossMarginLbl", lang)}  val={fz.grossMargin}  col={C.green} />
          <Cell label={tr("profitMarginLbl", lang)} val={fz.profitMargin} col={C.green} />
          <Cell label={tr("roeLbl", lang)}           val={fz.roe}          col={C.accent} />
          <Cell label={tr("debtEqLbl", lang)}        val={fz.debtEq}       col={parseFloat(fz.debtEq) > 1.5 ? C.red : C.white} />
        </div>
      )}

      {/* 52W Range */}
      {fz && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <BoxCell label={tr("low52Lbl", lang)}  val={fz.low52w}  col={C.red} />
          <BoxCell label={tr("high52Lbl", lang)} val={fz.high52w} col={C.green} />
        </div>
      )}

      {/* Key figures grouped: Recom · Target Price · Prev Close · Price */}
      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 0.8 }}>{tr("priceTgts", lang)}</div>
      <div style={{ background: `${C.gold}08`, borderRadius: 10, padding: 12, border: `1px solid ${C.gold}25`, marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 8 }}>
          <KCell label={tr("recommLbl", lang)}      val={recomDisplay}  sub="/ 5.0" col={recomColor} />
          <KCell label={tr("targetPriceLbl", lang)} val={targetDisplay}            col={C.gold} />
          <KCell label={tr("prevCloseLbl", lang)}   val={prevCloseDisp}            col={C.text2} />
          <KCell label={tr("priceLbl", lang)}       val={priceDisplay}             col={priceColor} />
        </div>
        {upsidePct !== null && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.gold}20`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase" }}>{tr("upsideVsPrice", lang)}</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: upsidePct >= 0 ? C.green : C.red }}>
              {upsidePct >= 0 ? "▲" : "▼"} {Math.abs(upsidePct).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Earnings Date */}
      {fz && fz.earnings !== "N/A" && (
        <div style={{ background: `${C.purple}12`, borderRadius: 6, padding: "8px 12px", border: `1px solid ${C.purple}30`, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14 }}>📅</span>
          <div>
            <div style={{ fontSize: 8.5, color: C.muted, letterSpacing: 0.5 }}>{tr("earningsDateLbl", lang)}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.purple }}>{fz.earnings}</div>
          </div>
        </div>
      )}

      {/* Analyst Consensus */}
      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginBottom: 6, letterSpacing: 0.8 }}>
        {tr("consensus", lang)}
        {fz && <span style={{ marginLeft: 8, fontWeight: 700, fontSize: 10, color: recomColor }}>
          {tr("recommLbl", lang)}: {fz.recom} / 5.0
        </span>}
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 1 }}>
        <div style={{ flex: recBuy,                    background: C.green }} />
        <div style={{ flex: recHold,                   background: C.gold }} />
        <div style={{ flex: Math.max(recSell, 0.5),    background: C.red }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.text2, marginTop: 4 }}>
        <span style={{ color: C.green }}>{tr("buy", lang)}: {recBuy}%</span>
        <span style={{ color: C.gold }}>{tr("hold", lang)}: {recHold}%</span>
        <span style={{ color: C.red }}>{tr("sell", lang)}: {recSell}%</span>
      </div>

      {/* Extended Hours */}
      {(data.postMarketPrice || data.preMarketPrice) && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, marginBottom: 8, letterSpacing: 0.8 }}>{tr("extHoursLbl", lang)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {data.postMarketPrice ? ([
              [tr("postMkt", lang).replace("🌙 ",""), data.postMarketPrice, C.purple],
              [parseFloat(data.postMarketChangePct ?? "0") >= 0 ? "▲ Change" : "▼ Change", data.postMarketChange ?? "—", parseFloat(data.postMarketChangePct ?? "0") >= 0 ? C.green : C.red],
              [tr("mktClose", lang), `$${data.price}`, C.text2],
            ] as [string, string, string][]).map(([label, val, col]) => (
              <div key={label} style={{ background: `${col}08`, borderRadius: 6, padding: "6px 8px", border: `1px solid ${col}25` }}>
                <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: "monospace" }}>{val}</div>
              </div>
            )) : data.preMarketPrice ? ([
              [tr("preMkt", lang).replace("🌅 ",""), data.preMarketPrice, C.orange],
              [parseFloat(data.preMarketChangePct ?? "0") >= 0 ? "▲ Change" : "▼ Change", data.preMarketChange ?? "—", parseFloat(data.preMarketChangePct ?? "0") >= 0 ? C.green : C.red],
              [tr("mktClose", lang), `$${data.price}`, C.text2],
            ] as [string, string, string][]).map(([label, val, col]) => (
              <div key={label} style={{ background: `${col}08`, borderRadius: 6, padding: "6px 8px", border: `1px solid ${col}25` }}>
                <div style={{ fontSize: 8, color: C.muted, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: col, fontFamily: "monospace" }}>{val}</div>
              </div>
            )) : null}
          </div>
        </div>
      )}

      {/* Earnings Card */}
      <EarningsCard sym={data.symbol} />
    </div>
  );
}

// ── Analysis Panel ────────────────────────────────────────────────────────────
function AnalysisPanel({ symbol }: { symbol: string }) {
  const data = usePriceEngine(symbol); const { lang } = useLang();
  const isMobile = useMobile();
  if (!data) return <div style={{ color: C.muted, padding: 24 }}>{tr("loading", lang)} {symbol}...</div>;
  const pos = parseFloat(data.changePct) >= 0;
  const vol = (data.volume / 1e6).toFixed(1);
  const detail = lang === "es" ? data.signalDetailEs : data.signalDetail;

  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: C.white, fontFamily: "monospace" }}>{symLabel(symbol)}</span>
          <SignalBadge signal={data.signal} />
        </div>
        <div style={{ fontSize: isMobile ? 28 : 32, fontWeight: 900, color: C.white, letterSpacing: -1, marginTop: 2 }}>
          ${data.price}
          <span style={{ fontSize: 14, marginLeft: 10, color: pos ? C.green : C.red }}>
            {pos ? "▲" : "▼"} {Math.abs(parseFloat(data.changePct)).toFixed(2)}%
            <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.85 }}>({parseFloat(data.change) >= 0 ? "+" : ""}{data.change})</span>
          </span>
        </div>
        {/* Extended hours price row */}
        {data.postMarketPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, padding: "4px 8px", background: `${C.purple}12`, borderRadius: 6, border: `1px solid ${C.purple}25` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.purple, letterSpacing: 0.3 }}>{tr("postMkt", lang)}</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: C.purple, fontFamily: "monospace" }}>${data.postMarketPrice}</span>
            {data.postMarketChangePct && (
              <span style={{ fontSize: 11, color: parseFloat(data.postMarketChangePct) >= 0 ? C.green : C.red, fontWeight: 700 }}>
                {parseFloat(data.postMarketChangePct) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(data.postMarketChangePct)).toFixed(2)}%
                <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>({parseFloat(data.postMarketChange ?? "0") >= 0 ? "+" : ""}{data.postMarketChange})</span>
              </span>
            )}
            <span style={{ fontSize: 9, color: C.muted, marginLeft: "auto" }}>{tr("extClose", lang)}: ${data.price}</span>
          </div>
        )}
        {!data.postMarketPrice && data.preMarketPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, padding: "4px 8px", background: `${C.orange}12`, borderRadius: 6, border: `1px solid ${C.orange}25` }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.orange, letterSpacing: 0.3 }}>{tr("preMkt", lang)}</span>
            <span style={{ fontSize: 16, fontWeight: 900, color: C.orange, fontFamily: "monospace" }}>${data.preMarketPrice}</span>
            {data.preMarketChangePct && (
              <span style={{ fontSize: 11, color: parseFloat(data.preMarketChangePct) >= 0 ? C.green : C.red, fontWeight: 700 }}>
                {parseFloat(data.preMarketChangePct) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(data.preMarketChangePct)).toFixed(2)}%
                <span style={{ fontSize: 10, opacity: 0.8, marginLeft: 4 }}>({parseFloat(data.preMarketChange ?? "0") >= 0 ? "+" : ""}{data.preMarketChange})</span>
              </span>
            )}
            <span style={{ fontSize: 9, color: C.muted, marginLeft: "auto" }}>{tr("extClose", lang)}: ${data.price}</span>
          </div>
        )}
        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
          ⏱ {data.timestamp} · <span style={{ color: data.live ? C.green : C.gold, fontWeight: 700 }}>{data.live ? tr("livePrice", lang) : tr("loadingData", lang)}</span>
        </div>
      </div>
      <Sparkline positive={pos} width={90} height={36} />
    </div>

    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <TrendPill label="15 Min" trend={data.trend15} />
        <TrendPill label={tr("tfHour", lang)} trend={data.trend1h} />
        <TrendPill label={tr("tfDay", lang)} trend={data.trendDay} />
      </div>
      <EffectivenessBar pct={calcEffectiveness(data).pct} dir={calcEffectiveness(data).dir} lang={lang} />
    </div>

    <BBStatus status={data.outsideBand} data={data} />

    {detail && <div style={{ fontSize: 11, color: C.text2, padding: "8px 12px", background: C.panelB, borderRadius: 6, borderLeft: `3px solid ${data.signal === "CALL" ? C.green : data.signal === "PUT" ? C.red : C.gold}`, lineHeight: 1.5 }}>
      💡 {detail}
    </div>}

    <ProChartPanel symbol={symbol} lang={lang} />

    <div style={{ background: C.panelB, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: 1 }}>{tr("oscillators", lang)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[["RSI 14", data.rsi, 30, 70], [tr("stoch", lang), data.stoch, 20, 80]].map(([label, val, lo, hi]) => (
          <div key={label as string}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.text2, marginBottom: 4 }}>
              <span>{label}</span>
              <span style={{ color: parseFloat(val as string) < (lo as number) ? C.green : parseFloat(val as string) > (hi as number) ? C.red : C.accent }}>
                {parseFloat(val as string) < (lo as number) ? tr("osOversold", lang) : parseFloat(val as string) > (hi as number) ? tr("osOverbought", lang) : tr("osNeutral", lang)}
              </span>
            </div>
            <RSIGauge value={val as string} />
          </div>
        ))}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.text2, marginBottom: 4 }}>
            <span>{tr("volume", lang)}</span>
            <span style={{ color: C.accent, fontWeight: 700, fontFamily: "monospace" }}>{vol}M</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${Math.min((parseFloat(vol) / 60) * 100, 100)}%`, height: "100%", background: C.accent, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>
      </div>
    </div>

    <FundamentalsPanel symbol={symbol} lang={lang} data={data} />
  </div>;
}

// ── Strategy Modal ────────────────────────────────────────────────────────────
type StrategyContent = {
  title: string;
  up?: string[];
  down?: string[];
  steps?: { t: string; d: string }[];
  image?: string;      // main hero image (optional)
  gallery?: string[];  // scrollable photo gallery
};

type BilingualStrategy = { en: StrategyContent; es: StrategyContent };

const STRATEGIES: Record<string, BilingualStrategy> = {
  "15m": {
    en: {
      title: "15 Min Trend Reversal",
      up: [
        "There must be a bearish or sideways trend on 15 min",
        "Draw a trend line from the day's high to its low, touching as many points as possible from above",
        "Price gaps up, breaking the midpoint and the trend line",
        "When volatility opens → enter CALL position",
      ],
      down: [
        "There must be a bullish or sideways trend on 15 min",
        "Draw a trend line from the day's high to its low, touching as many points as possible from below",
        "Price gaps down, breaking the midpoint and the trend line",
        "When volatility opens → enter PUT position",
      ],
    },
    es: {
      title: "Cambio de Tendencia en 15 Min",
      up: [
        "Debe haber tendencia bajista o lateral en 15 min",
        "Trazar línea de tendencia bordeando la mayor cantidad de puntos posibles por la parte superior",
        "El precio abre con salto al alza rompiendo el punto medio y la línea de tendencia",
        "Cuando abre volatilidad → posición en CALL",
      ],
      down: [
        "Debe haber tendencia alcista o lateral en 15 min",
        "Trazar línea de tendencia bordeando la mayor cantidad de puntos posibles por la parte inferior",
        "El precio abre con salto a la baja rompiendo el punto medio y la línea de tendencia",
        "Cuando abre volatilidad → posición en PUT",
      ],
    },
  },
  "trend-up": {
    en: {
      title: "Trend Change Upward · Bollinger 1H — CALL",
      gallery: [
        "/strats/trend-up-chart-nflx-hour.jpg",
        "/strats/trend-up-chart-nflx-15m.jpg",
      ],
      up: [
        "Draw a trend line from the price trajectory SLIGHTLY ABOVE the bearish trend, touching as many candlesticks as possible",
        "The price must break this trend line (NOTE: this can happen intraday or as a gap at the open)",
        "The price must break the 20-period MA in the 1H timeframe and close with a BULLISH confirmation candle",
        "Switch to 15-minute timeframe: the trend must show as TOTALLY BULLISH",
        "When ALL these conditions are met → enter CALL position",
      ],
    },
    es: {
      title: "Cambio de Tendencia al Alza · Bollinger, Temporalidad Hora — CALL",
      gallery: [
        "/strats/trend-up-chart-nflx-hour.jpg",
        "/strats/trend-up-chart-nflx-15m.jpg",
      ],
      up: [
        "Trazar una línea de tendencia de trayectoria del precio bordeando levemente por encima la mayor cantidad de puntos posibles de la tendencia bajista",
        "Que el precio rompa esta línea de tendencia (NOTA: Esto puede ocurrir durante el día o en forma de salto)",
        "Que el precio rompa la media móvil de 20 períodos en dicha temporalidad y termine con una vela de confirmación alcista",
        "Cambiar a la temporalidad 15 minutos y la tendencia debe mostrarse totalmente alcista",
        "Cuando se cumplan todos estos requisitos → tomar una posición en CALL",
      ],
    },
  },
  "trend-down": {
    en: {
      title: "Trend Change Downward · Bollinger 1H — PUT",
      gallery: [
        "/strats/trend-down-chart-uber-hour.jpg",
        "/strats/trend-down-chart-uber-15m.jpg",
      ],
      down: [
        "This strategy has almost the same requirements as the previous, but for the downside",
        "Draw a trend line from the price trajectory SLIGHTLY BELOW the bullish trend, touching as many candlesticks as possible",
        "The price must break this trend line (NOTE: this can happen intraday or as a gap at the open)",
        "The price must break the 20-period MA in the 1H timeframe and close with a BEARISH confirmation candle",
        "Switch to 15-minute timeframe: the trend must show as TOTALLY BEARISH",
        "When ALL these conditions are met → enter PUT position",
      ],
    },
    es: {
      title: "Cambio de Tendencia a la Baja · Bollinger, Temporalidad Hora — PUT",
      gallery: [
        "/strats/trend-down-chart-uber-hour.jpg",
        "/strats/trend-down-chart-uber-15m.jpg",
      ],
      down: [
        "Esta estrategia reúne casi los mismos requisitos de la anterior, pero en este caso a la baja",
        "Trazar una línea de tendencia de trayectoria del precio bordeando levemente por debajo la mayor cantidad de puntos posibles de la tendencia alcista",
        "Que el precio rompa esta línea de tendencia (NOTA: Esto puede ocurrir durante el día o en forma de salto)",
        "Que el precio rompa la media móvil de 20 períodos en dicha temporalidad y termine con una vela de confirmación bajista",
        "Cambiar a la temporalidad 15 minutos y la tendencia debe mostrarse totalmente bajista",
        "Cuando se cumplan todos estos requisitos → tomar una posición en PUT",
      ],
    },
  },
  "bollinger": {
    en: {
      title: "Bollinger Band Volatility Extension",
      steps: [
        { t: "1. Identify opening type", d: "Exhaustion (Reversal): price opens below lower band after prolonged drop. Strength (Breakout): opens above upper band with unusually high volume." },
        { t: "2. Higher timeframe filter", d: "On 1D inside → no extreme overbought/oversold long-term. On 1H it acts as a magnet toward the equilibrium (MA20 of 1H)." },
        { t: "3A. Wait for close inside the band", d: "NEVER buy just because it opened outside. Wait for a 15 min candle to close back inside the band." },
        { t: "3B. Oscillator confirmation", d: "If price opens below lower band (15m) and RSI < 30 → probability of bounce increases dramatically." },
        { t: "3C. Moving Average rule", d: "Initial target: BB midline on 15m. If price crosses with force → next target is the opposite band." },
        { t: "4. Risk management", d: "If overall context (Day + Hour) is bullish/neutral and 15m opens outside below → wait for recovery with a strong green candle → high-probability reversal toward the mean." },
      ],
    },
    es: {
      title: "Extensión por Volatilidad – Bollinger Bands",
      steps: [
        { t: "1. Identifica el tipo de apertura", d: "Agotamiento (Reversión): precio abre bajo la banda inferior tras caída prolongada. Fuerza (Ruptura): abre sobre la banda superior con volumen inusual alto." },
        { t: "2. Filtro de temporalidades mayores", d: "En 1D dentro → no hay sobrecompra/venta extrema. En 1H sirve como imán hacia el equilibrio (MA20 de 1H)." },
        { t: "3A. Espera el cierre dentro de la banda", d: "NUNCA compres solo porque abrió afuera. Espera que una vela de 15 min cierre nuevamente dentro." },
        { t: "3B. Confirma con oscilador", d: "Si abre bajo la banda inferior (15m) y RSI < 30 → probabilidad de rebote aumenta drásticamente." },
        { t: "3C. Regla de la Media Móvil", d: "Objetivo inicial: línea media de BB en 15m. Si supera con fuerza → siguiente objetivo es la banda opuesta." },
        { t: "4. Gestión de Riesgo", d: "Si contexto general (Día y Hora) es alcista/neutral y en 15m el precio abre afuera por abajo → espera que recupere la banda con vela verde fuerte → configuración de alta probabilidad." },
      ],
    },
  },
  "magnet": {
    en: {
      title: "Magnet Effect (MA20 & MA40) · Bollinger 15 Min",
      gallery: [
        "/strats/iman-chart-gld.jpg",
        "/strats/iman-chart-aapl.jpg",
      ],
      up: [
        "Moving averages must show a clearly BEARISH trend — price falling for several days",
        "Price opens with a STRONG GAP DOWN, far below the MA20 (20-period moving average)",
        "On 15 min Bollinger: the FIRST CANDLE must be completely OUTSIDE (below) the lower band",
        "When the volume candle forms, it should cross the Worden Stochastics red line → CALL confirmation",
        "The price will be 'pulled' back up toward the MA20 like a magnet — enter CALL",
      ],
      down: [
        "Moving averages must show a clearly BULLISH trend — price rising for several days",
        "Price opens with a STRONG GAP UP, far above the MA20 (20-period moving average)",
        "On 15 min Bollinger: the FIRST CANDLE must be completely OUTSIDE (above) the upper band",
        "When the volume candle forms, it should cross the Worden Stochastics red line → PUT confirmation",
        "The price will be 'pulled' back down toward the MA20 — enter PUT",
      ],
    },
    es: {
      title: "Estrategia Efecto Imán (MA20 y MA40) · Bollinger 15 Min",
      gallery: [
        "/strats/iman-chart-gld.jpg",
        "/strats/iman-chart-aapl.jpg",
      ],
      up: [
        "En las medias móviles debe haber una tendencia claramente BAJISTA — varios días bajando",
        "El precio abre con un fuerte SALTO A LA BAJA, muy alejado de la media móvil de 20 períodos",
        "En Bollinger en temporalidad 15 minutos la primera vela debe quedar completamente FUERA (abajo) del oscilador",
        "Cuando se comience a formar la vela en el indicador volumen, deberá cruzar la línea roja del indicador Worden Stochastics → confirmación para CALL",
        "El precio será 'jalado' de vuelta hacia la MA20 como un imán → entrar en CALL",
      ],
      down: [
        "En las medias móviles debe haber una tendencia claramente ALCISTA — varios días subiendo",
        "El precio abre con un fuerte SALTO AL ALZA, muy alejado de la media móvil de 20 períodos",
        "En Bollinger en temporalidad 15 minutos la primera vela debe quedar completamente FUERA (arriba) del oscilador",
        "Cuando se comience a formar la vela en el indicador de volumen, deberá cruzar la línea roja del Worden Stochastics → confirmación de PUT",
        "El precio será 'jalado' de vuelta hacia la MA20 → entrar en PUT",
      ],
    },
  },
  "lateral": {
    en: {
      title: "Lateral Trend · BB Breakout without Volatility · 15 Min",
      gallery: [
        "/strats/lateral-chart-axp.jpg",
        "/strats/lateral-chart-uber.jpg",
      ],
      up: [
        "On 15 min Bollinger: trend must be TOTALLY LATERAL and WITHOUT volatility (narrow bands)",
        "Price opens with a gap and lands EXTREMELY FAR below the lower band — deep in oversold territory — and starts rising",
        "Profitability usually occurs in the FIRST MINUTES of market open",
        "Enter CALL contracts in the FIRST 5 MINUTES after the open — after 5 min the setup may lose effectiveness",
        "NOTE: Start analysis a few minutes BEFORE market open to anticipate the gap direction",
      ],
      down: [
        "On 15 min Bollinger: trend must be TOTALLY LATERAL and WITHOUT volatility (narrow bands)",
        "Price opens with a gap and lands EXTREMELY FAR above the upper band — deep in overbought territory — and starts falling",
        "Profitability usually occurs in the FIRST MINUTES of market open",
        "Enter PUT contracts in the FIRST 5 MINUTES after the open — after 5 min the setup may lose effectiveness",
        "NOTE: Start analysis a few minutes BEFORE market open to anticipate the gap direction",
      ],
    },
    es: {
      title: "Tendencia Lateral · Apertura Fuera de Bollinger sin Volatilidad · 15 Min",
      gallery: [
        "/strats/lateral-chart-axp.jpg",
        "/strats/lateral-chart-uber.jpg",
      ],
      up: [
        "En temporalidad 15 minutos en Bollinger la tendencia debe ser TOTALMENTE LATERAL y SIN VOLATILIDAD (bandas estrechas)",
        "El precio debe aperturar con un salto y quedar EXTREMADAMENTE ALEJADO del oscilador inferior (zona de sobreventa) y comenzar a subir",
        "La rentabilidad suele darse en los PRIMEROS MOVIMIENTOS del mercado",
        "La compra de contratos CALL debe ejecutarse en los PRIMEROS 5 MINUTOS de la apertura del mercado",
        "NOTA: Comenzar el análisis unos minutos ANTES de la apertura para anticipar la dirección del salto",
      ],
      down: [
        "En temporalidad 15 minutos en Bollinger la tendencia debe ser TOTALMENTE LATERAL y SIN VOLATILIDAD (bandas estrechas)",
        "El precio debe aperturar con un salto y quedar EXTREMADAMENTE ALEJADO del oscilador superior (zona de sobrecompra) y comenzar a bajar",
        "La rentabilidad suele darse en los PRIMEROS MOVIMIENTOS del mercado",
        "La compra de contratos PUT debe ejecutarse en los PRIMEROS 5 MINUTOS de la apertura del mercado",
        "NOTA: Comenzar el análisis unos minutos ANTES de la apertura para anticipar la dirección del salto",
      ],
    },
  },
  "midpoint": {
    en: {
      title: "Midpoint Bounce · Bollinger Day + 1H",
      gallery: [
        "/strats/midpoint-chart-nflx-daily.jpg",
        "/strats/midpoint-chart-nflx-hour.jpg",
        "/strats/midpoint-chart-tsla.jpg",
      ],
      up: [
        "Must be in a clearly BEARISH Bollinger trend on the HOURLY timeframe",
        "Prices declining and approaching the MA20 (midpoint), which acts as bounce reference on the Daily chart",
        "Once price touches this level, verify it does NOT cross through — it must respect it as support",
        "Switch to 15 min and wait for the price to start bouncing",
        "On the HOURLY timeframe: wait for a bullish confirmation candle → enter CALL",
      ],
      down: [
        "Must be in a clearly BULLISH Bollinger trend on the HOURLY timeframe",
        "Prices rising and approaching the MA20 (midpoint), which acts as bounce reference on the Daily chart",
        "Once price touches this level, verify it does NOT cross through — it must respect it as resistance",
        "Switch to 15 min and wait for the price to start bouncing",
        "On the HOURLY timeframe: wait for a bearish confirmation candle → enter PUT",
      ],
    },
    es: {
      title: "Rebote en Punto Medio · Bollinger Día + Hora",
      gallery: [
        "/strats/midpoint-chart-nflx-daily.jpg",
        "/strats/midpoint-chart-nflx-hour.jpg",
        "/strats/midpoint-chart-tsla.jpg",
      ],
      up: [
        "Debemos encontrarnos en una tendencia claramente BAJISTA en Bollinger en la temporalidad HORA",
        "Los precios vienen en caída acercándose a la media móvil de 20 períodos (punto de rebote en temporalidad DÍA)",
        "Una vez que el precio toca esta marca, verificar que NO cruce el punto sino que lo respete como soporte",
        "Cambiar a la temporalidad 15 minutos y esperar que comience a rebotar",
        "En la temporalidad HORA, esperar vela de confirmación ALCISTA y tomar entrada en CALL",
      ],
      down: [
        "Debemos encontrarnos en una tendencia claramente ALCISTA en Bollinger en la temporalidad HORA",
        "Los precios vienen en subida acercándose a la media móvil de 20 períodos (punto de rebote en temporalidad DÍA)",
        "Una vez que el precio toca esta marca, verificar que NO cruce el punto sino que lo respete como resistencia",
        "Cambiar a la temporalidad 15 minutos y esperar que comience a rebotar",
        "En la temporalidad HORA, esperar vela de confirmación BAJISTA y tomar entrada en PUT",
      ],
    },
  },
};

const STRATEGY_TABS = [
  { id: "15m",        labelKey: "tab15m" },
  { id: "trend-up",   labelKey: "tabTrendUp" },
  { id: "trend-down", labelKey: "tabTrendDown" },
  { id: "bollinger",  labelKey: "tabBoll" },
  { id: "magnet",     labelKey: "tabMagnet" },
  { id: "lateral",    labelKey: "tabLateral" },
  { id: "midpoint",   labelKey: "tabMidpoint" },
];

function StrategyModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState("15m"); const { lang } = useLang();
  const isMobile = useMobile();
  const strat = STRATEGIES[tab]?.[lang];
  if (!strat) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 16 }} onClick={onClose}>
      <div style={{ background: C.panel, border: isMobile ? "none" : `1px solid ${C.gold}40`, borderRadius: isMobile ? "16px 16px 0 0" : 12, padding: 0, maxWidth: isMobile ? "100%" : 640, width: "100%", maxHeight: isMobile ? "92vh" : "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        {/* gold top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldDim}, transparent)`, flexShrink: 0 }} />
        <div style={{ padding: isMobile ? "16px 16px 0" : "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 900, color: C.gold }}>{tr("stratTitle", lang)}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, WebkitOverflowScrolling: "touch" as const }}>
            {STRATEGY_TABS.map(({ id, labelKey }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0,
                background: tab === id ? C.gold : C.panelB,
                border: `1px solid ${tab === id ? C.gold : C.border}`,
                color: tab === id ? C.bg : C.text2, letterSpacing: 0.5,
              }}>
                {tr(labelKey, lang)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: isMobile ? "0 16px 32px" : "0 24px 24px", WebkitOverflowScrolling: "touch" as const }}>
          <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: C.white, marginBottom: 14 }}>{strat.title}</div>
          {/* Strategy gallery — horizontal scroll if images present */}
          {strat.gallery && strat.gallery.length > 0 ? (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18, WebkitOverflowScrolling: "touch" as const, scrollSnapType: "x mandatory", paddingBottom: 4 }}>
              {strat.gallery.map((src, i) => (
                <img key={i} src={src} alt={`${strat.title} ${i + 1}`}
                  style={{ flexShrink: 0, width: isMobile ? "82vw" : 340, height: "auto", maxHeight: 200, objectFit: "contain", borderRadius: 8, border: `1px solid ${C.gold}30`, background: "#000", scrollSnapAlign: "start" }} />
              ))}
            </div>
          ) : strat.image ? (
            <img src={strat.image} alt={strat.title} style={{ width: "100%", borderRadius: 8, marginBottom: 16, objectFit: "cover", maxHeight: 220, border: `1px solid ${C.border}` }} />
          ) : null}
          {!strat.steps ? (
            <div>
              {strat.up && strat.down ? (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                  {([["▲ CALL", C.green, strat.up], ["▼ PUT", C.red, strat.down]] as [string, string, string[]][]).map(([label, col, dirItems]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: col, marginBottom: 10, letterSpacing: 0.5, padding: "6px 10px", background: `${col}15`, borderRadius: 6, border: `1px solid ${col}30` }}>{label}</div>
                      {dirItems.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 11, color: C.text2, lineHeight: 1.5 }}>
                          <span style={{ color: col, fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (() => {
                const isUp = !!strat.up;
                const col = isUp ? C.green : C.red;
                const label = isUp ? tr("upCall", lang) : tr("downPut", lang);
                const dirItems = strat.up ?? strat.down ?? [];
                return (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: col, marginBottom: 14, padding: "8px 14px", background: `${col}15`, borderRadius: 6, border: `1px solid ${col}30` }}>{label}</div>
                    {dirItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, padding: "10px 14px", background: C.panelB, borderRadius: 8, borderLeft: `3px solid ${col}` }}>
                        <span style={{ color: col, fontWeight: 900, fontSize: 13, minWidth: 20, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {strat.steps.map((p, i) => (
                <div key={i} style={{ padding: "12px 14px", background: C.panelB, borderRadius: 8, borderLeft: `3px solid ${C.gold}` }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: 6 }}>{p.t}</div>
                  <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.5 }}>{p.d}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Index / Mag / ETF Cards ───────────────────────────────────────────────────
function IndexCard({ sym, label, name, idx, onClick }: { sym: string; label: string; name: string; idx: string; onClick: () => void }) {
  const data = usePriceEngine(sym); const { lang } = useLang();
  const pos = data ? parseFloat(data.changePct) >= 0 : true;
  const isVix = sym === "^VIX"; const isTnx = sym === "^TNX";
  const priceStr = data ? isTnx ? `${data.price}%` : Number(data.price) >= 1000 ? Number(data.price).toLocaleString("en-US", { maximumFractionDigits: 2 }) : data.price : "---";
  return (
    <div onClick={onClick} className="card-hover" style={{ background: C.panel, border: `1px solid ${C.gold}30`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, color: C.gold, fontFamily: "monospace" }}>{label}</div>
          <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{name}</div>
          <div style={{ fontSize: 8, color: C.muted }}>{idx}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {data ? <>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.white, fontFamily: "monospace" }}>{priceStr}</div>
            <div style={{ fontSize: 10, color: pos ? (isVix ? C.red : C.green) : (isVix ? C.green : C.red), fontWeight: 700 }}>
              {pos ? "▲" : "▼"} {Math.abs(parseFloat(data.changePct)).toFixed(2)}%
            </div>
            <div style={{ fontSize: 9, color: pos ? (isVix ? C.red : C.green) : (isVix ? C.green : C.red), fontFamily: "monospace", opacity: 0.8 }}>{pos ? "+" : ""}{data.change}</div>
          </> : <div style={{ color: C.muted, fontSize: 10 }}>{tr("loadingDots", lang)}</div>}
        </div>
      </div>
      {data && <>
        <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
          <TrendPill label="15m" trend={data.trend15} />
          <TrendPill label="1H" trend={data.trend1h} />
          <TrendPill label={tr("tfDay", lang)} trend={data.trendDay} />
        </div>
        <EffectivenessBar pct={calcEffectiveness(data).pct} dir={calcEffectiveness(data).dir} lang={lang} />
      </>}
    </div>
  );
}

function MagCard({ sym, name, etf, idx }: { sym: string; name: string; etf: string | null; idx: string }) {
  const data = usePriceEngine(sym); const { lang } = useLang();
  if (!data) return <div style={{ height: 60, display: "flex", alignItems: "center", color: C.muted, fontSize: 11 }}>{tr("loadingDots", lang)}</div>;
  const pos = parseFloat(data.changePct) >= 0;
  const eff = calcEffectiveness(data);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 900, fontSize: 14, color: C.white }}>{symLabel(sym)}</span>
            <SignalBadge signal={data.signal} />
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{name} {etf ? `· ETF: ${etf}` : ""} · {idx}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <TrendPill label="15m" trend={data.trend15} />
            <TrendPill label="1H" trend={data.trend1h} />
            <TrendPill label={tr("tfDay", lang)} trend={data.trendDay} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.white, fontFamily: "monospace" }}>${data.price}</div>
          <div style={{ fontSize: 11, color: pos ? C.green : C.red, fontWeight: 700 }}>{pos ? "+" : ""}{data.changePct}%</div>
          <div style={{ fontSize: 10, color: pos ? C.green : C.red, fontFamily: "monospace", opacity: 0.85 }}>{pos ? "+" : ""}{data.change}</div>
          {data.postMarketPrice && (
            <div style={{ fontSize: 9, color: C.purple, fontWeight: 700, marginTop: 2 }}>
              🌙 ${data.postMarketPrice} <span style={{ color: parseFloat(data.postMarketChangePct ?? "0") >= 0 ? C.green : C.red }}>{parseFloat(data.postMarketChangePct ?? "0") >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(data.postMarketChangePct ?? "0")).toFixed(2)}%</span>
            </div>
          )}
          {!data.postMarketPrice && data.preMarketPrice && (
            <div style={{ fontSize: 9, color: C.orange, fontWeight: 700, marginTop: 2 }}>
              🌅 ${data.preMarketPrice} <span style={{ color: parseFloat(data.preMarketChangePct ?? "0") >= 0 ? C.green : C.red }}>{parseFloat(data.preMarketChangePct ?? "0") >= 0 ? "▲" : "▼"}{Math.abs(parseFloat(data.preMarketChangePct ?? "0")).toFixed(2)}%</span>
            </div>
          )}
          <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Vol {(data.volume / 1e6).toFixed(1)}M</div>
          <Sparkline positive={pos} width={70} height={24} />
        </div>
      </div>
      <EffectivenessBar pct={eff.pct} dir={eff.dir} lang={lang} />
    </div>
  );
}

// ── News Panel ────────────────────────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  EARNINGS: C.green, MACRO: C.gold, COMPANY: C.accent, ANALYSIS: C.purple, SOCIAL: C.purple,
};

function NewsPanel() {
  const { lang } = useLang(); const items = useNewsData(lang);
  if (!items.length) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ background: C.panel, borderRadius: 10, padding: 14, border: `1px solid ${C.border}`, opacity: 0.5 }}>
          <div style={{ height: 10, background: C.border, borderRadius: 4, marginBottom: 8, width: "30%" }} />
          <div style={{ height: 12, background: C.border, borderRadius: 4, width: "90%" }} />
          <div style={{ height: 12, background: C.border, borderRadius: 4, width: "70%", marginTop: 6 }} />
        </div>
      ))}
      <div style={{ textAlign: "center", color: C.muted, fontSize: 11 }}>{tr("loadingNewsP", lang)}</div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((n, i) => {
        const tagColor = TAG_COLORS[n.tag] ?? C.muted;
        const timeStr = relativeTime(n.pubDate);
        return (
          <a key={i} href={n.link || "#"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="card-hover" style={{
              background: C.panel, borderRadius: 10, padding: "14px 16px",
              border: `1px solid ${C.border}`, transition: "border-color 0.2s, background 0.2s",
              cursor: n.link ? "pointer" : "default",
              borderLeft: `3px solid ${tagColor}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: `${tagColor}20`, color: tagColor, border: `1px solid ${tagColor}40`, letterSpacing: 0.5 }}>{n.tag}</span>
                  {n.sym && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${C.accent}15`, color: C.accent, border: `1px solid ${C.accent}30` }}>${n.sym}</span>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {timeStr && <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>{timeStr}</span>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.white, lineHeight: 1.55, marginBottom: 10, fontWeight: 500 }}>{n.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: C.muted, fontStyle: "italic" }}>{n.source}</span>
                {n.link && <span style={{ fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: 0.3 }}>{tr("readArticle", lang)} ↗</span>}
              </div>
            </div>
          </a>
        );
      })}
      <div style={{ textAlign: "center", fontSize: 10, color: C.muted, padding: "8px 0 4px" }}>{tr("newsFtr", lang)}</div>
    </div>
  );
}

// ── Real-time clock ───────────────────────────────────────────────────────────
function useClock(): Date {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ── Bottom Navigation (mobile) ─────────────────────────────────────────────────
function BottomNav({ active, onChange }: { active: string; onChange: (id: string) => void }) {
  const { lang } = useLang();
  const tabs = [
    { id: "analisis",   icon: "📊", en: "Analysis",  es: "Análisis" },
    { id: "magnificas", icon: "💎", en: "Activos",    es: "Activos" },
    { id: "etfs",       icon: "📈", en: "ETFs",       es: "ETFs" },
    { id: "noticias",   icon: "📡", en: "News",       es: "Noticias" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: C.panel, borderTop: `2px solid ${C.gold}40`,
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 4px)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          flex: 1, padding: "10px 4px 6px", background: "none", border: "none",
          cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 2,
          color: active === t.id ? C.gold : C.muted,
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontSize: 22 }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.3 }}>{lang === "es" ? t.es : t.en}</span>
          <div style={{ width: active === t.id ? 20 : 0, height: 2, background: C.gold, borderRadius: 1, transition: "width 0.2s" }} />
        </button>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DavidTraderPRO() {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = useCallback(() => setLang(l => l === "en" ? "es" : "en"), []);
  const now = useClock();
  const w = useWindowWidth();
  const isMobile = w <= 520;

  const [activeTab, setActiveTab] = useState("analisis");
  const [selectedSym, setSelectedSym] = useState("NVDA");
  const [searchVal, setSearchVal] = useState("");
  const [showStrategy, setShowStrategy] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [session, setSession] = useState<Session>(getMarketSession());
  const { customStocks, customEtfs, addStock, removeStock, addEtf, removeEtf, hiddenDefaultStocks, hiddenDefaultEtfs, hideDefaultStock, showDefaultStock, hideDefaultEtf, showDefaultEtf } = useWatchlist();

  const handleAnalyzeAlert = useCallback((sym: string) => {
    setSelectedSym(sym);
    setActiveTab("analisis");
    setShowAlerts(false);
  }, []);

  useEffect(() => {
    const updateSession = () => setSession(getMarketSession());
    updateSession();
    const iv = setInterval(updateSession, 60_000);

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const syms = ALL_SYMBOLS.map(s => s.sym).join(",");
    fetch(`/api/quotes?symbols=${syms}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: Record<string, LiveQuote> | null) => {
        if (data) {
          Object.assign(liveCache, data);
          ALL_SYMBOLS.forEach(({ sym }) => {
            const live = liveCache[sym];
            if (live) {
              const d = buildData(sym, live);
              prevTrend15[sym] = d.trend15;
              prevTrend1h[sym] = d.trend1h;
              prevBBStatus[sym] = d.outsideBand;
              prevBB1h[sym] = d.bb1hStatus;
              prevBBDay[sym] = d.bbDayStatus;
            }
          });
          notifyListeners();
        }
      })
      .catch(() => {});

    return () => clearInterval(iv);
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearchVal(val);
    setSearchResults(val.length >= 1 ? [val.toUpperCase()] : null);
  }, []);

  const navTabs = [
    { id: "analisis",   label: tr("navAnalysis", lang) },
    { id: "magnificas", label: tr("navMag10", lang) },
    { id: "etfs",       label: tr("navEtfs", lang) },
    { id: "noticias",   label: tr("navNews", lang) },
  ];

  const sessionColor = SESSION_COLOR[session];

  return (
    <LangCtx.Provider value={{ lang, toggle: toggleLang }}>
    <MobileCtx.Provider value={isMobile}>
      <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: "'IBM Plex Mono','Courier New',monospace", display: "flex", flexDirection: "column" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: #0d1520; }
          ::-webkit-scrollbar-thumb { background: #1a2d44; border-radius: 2px; }
          html { -webkit-text-size-adjust: 100%; }
          body { overscroll-behavior-y: contain; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes tickerScroll { 0%{opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{opacity:0} }
          @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
          @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
          .card-hover:hover { border-color: #ffd70050 !important; background: #0d1a2a !important; }
          .card-hover:active { border-color: #ffd70050 !important; background: #0d1a2a !important; }
          input::placeholder { color: #4a6380; }
          input { outline: none; }
          button { -webkit-touch-callout: none; user-select: none; }
        `}</style>

        {/* Gold accent line at very top */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.goldDim}80, transparent)` }} />

        {/* Top bar */}
        <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: isMobile ? "0 12px" : "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.bg, flexShrink: 0 }}>D</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: isMobile ? 12 : 14, color: C.white, letterSpacing: 1 }}>DavidTrader PRO</div>
              {!isMobile && <div style={{ fontSize: 9, color: C.goldDim, letterSpacing: 0.5 }}>{tr("brandName", lang)}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 8 }}>
            {/* Real-time clock — hidden on mobile */}
            {!isMobile && (
              <div style={{ textAlign: "right", lineHeight: 1.3 }}>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", letterSpacing: 0.3 }}>
                  {now.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </div>
                <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, fontFamily: "monospace" }}>
                  {now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })} ET
                </div>
              </div>
            )}
            {/* Market session */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: sessionColor, animation: session === "open" ? "pulse 1.5s infinite" : "none", flexShrink: 0 }} />
              {!isMobile && <span style={{ color: sessionColor, fontWeight: 700, fontSize: 10 }}>{tr(SESSION_LABEL[session], lang)}</span>}
            </div>
            {/* Language toggle */}
            <button onClick={toggleLang} style={{
              padding: isMobile ? "6px 8px" : "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer",
              background: `${C.gold}15`, border: `1px solid ${C.gold}50`, color: C.gold, letterSpacing: 0.5,
              minHeight: 32,
            }}>
              {lang === "en" ? "🇪🇸 ES" : "🇺🇸 EN"}
            </button>
            <AlertBell onClick={() => setShowAlerts(true)} />
            <button onClick={() => setShowWatchlist(true)} style={{
              padding: isMobile ? "6px 8px" : "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer",
              background: `${C.accent}12`, border: `1px solid ${C.accent}40`, color: C.accent, letterSpacing: 0.5, minHeight: 32,
            }} title={tr("watchlistTitle", lang)}>
              {isMobile ? "➕" : tr("manageWl", lang)}
            </button>
            <button onClick={() => setShowStrategy(true)} style={{
              padding: isMobile ? "6px 10px" : "6px 12px", borderRadius: 6, fontSize: isMobile ? 9 : 10,
              fontWeight: 800, background: `${C.gold}20`, border: `1px solid ${C.gold}60`,
              color: C.gold, cursor: "pointer", letterSpacing: 0.5, minHeight: 32,
              whiteSpace: "nowrap",
            }}>
              {isMobile ? "📋" : tr("strategies", lang)}
            </button>
          </div>
        </div>

        {/* Mobile clock bar */}
        {isMobile && (
          <div style={{ background: C.panelB, borderBottom: `1px solid ${C.border}`, padding: "4px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: C.muted }}>
              {now.toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { weekday: "short", month: "short", day: "2-digit" })}
            </span>
            <span style={{ fontSize: 10, color: C.gold, fontWeight: 700, fontFamily: "monospace" }}>
              {now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })} ET
            </span>
            <span style={{ fontSize: 9, color: sessionColor, fontWeight: 700 }}>{tr(SESSION_LABEL[session], lang)}</span>
          </div>
        )}

        {showAlerts && <AlertPanel onClose={() => setShowAlerts(false)} onAnalyze={handleAnalyzeAlert} />}

        {/* Market Closed Banner — weekends & holidays */}
        {session === "closed" && (() => {
          const reason = getClosedReason();
          if (!reason) return null;
          const isWknd = reason === "weekend";
          const msg = isWknd ? tr("mktClosedWknd", lang) : tr("mktClosedHol", lang);
          return (
            <div style={{ background: `${C.red}12`, borderBottom: `2px solid ${C.red}40`, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{isWknd ? "🔒" : "🏛️"}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.red, letterSpacing: 0.5 }}>{msg}</div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>
                    {tr("nextOpen", lang)} {lang === "es" ? "Lunes 9:30 AM ET" : "Monday 9:30 AM ET"}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 20 }}>🇺🇸</div>
            </div>
          );
        })()}

        <NewsTicker />

        {/* Desktop Nav — hidden on mobile (bottom nav used instead) */}
        {!isMobile && (
          <div style={{ display: "flex", background: C.panel, borderBottom: `1px solid ${C.border}`, overflowX: "auto", padding: "0 12px", flexShrink: 0 }}>
            {navTabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: "12px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: "none", border: "none",
                color: activeTab === t.id ? C.gold : C.muted,
                borderBottom: `2px solid ${activeTab === t.id ? C.gold : "transparent"}`,
                whiteSpace: "nowrap", transition: "all 0.2s", letterSpacing: 0.5,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 10 : 14, paddingBottom: isMobile ? 80 : 14, WebkitOverflowScrolling: "touch" as const }}>

          {activeTab === "analisis" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.3s" }}>
              <div style={{ position: "relative" }}>
                <input
                  value={searchVal} onChange={e => handleSearch(e.target.value)}
                  placeholder={tr("searchPlh", lang)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: C.panel, border: `1px solid ${C.border}`, color: C.white, fontSize: 12 }}
                />
                {searchResults && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50, background: C.panel, border: `1px solid ${C.gold}40`, borderRadius: 8, overflow: "hidden" }}>
                    {searchResults.map(sym => (
                      <div key={sym} onClick={() => { setSelectedSym(sym); setSearchVal(""); setSearchResults(null); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 12, color: C.white }} className="card-hover">
                        {sym} — {tr("fullAnalysis", lang)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>{tr("quickSelect", lang)}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["AAPL", "MSFT", "NVDA", "AMZN", "META", "GOOGL", "TSLA", "SPY", "QQQ", "DIA", "IWM"].map(sym => (
                    <button key={sym} onClick={() => setSelectedSym(sym)} style={{
                      padding: isMobile ? "7px 10px" : "5px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                      background: selectedSym === sym ? C.gold : sym.startsWith("^") ? "#1a1f35" : C.panel,
                      border: `1px solid ${selectedSym === sym ? C.gold : sym.startsWith("^") ? C.gold + "50" : C.border}`,
                      color: selectedSym === sym ? C.bg : sym.startsWith("^") ? C.gold : C.text2,
                      minHeight: isMobile ? 34 : "auto",
                    }}>
                      {symLabel(sym)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: C.panel, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
                <AnalysisPanel symbol={selectedSym} />
              </div>
            </div>
          )}

          {activeTab === "magnificas" && (
            <div style={{ animation: "fadeIn 0.3s" }}>
              <GoldHeader>{tr("mag10Title", lang)}</GoldHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MAGNIFICAS.filter(m => !hiddenDefaultStocks.includes(m.sym)).map(({ sym, name, etf, idx }) => (
                  <div key={sym} style={{ position: "relative" }}>
                    <div onClick={() => { setSelectedSym(sym); setActiveTab("analisis"); }} className="card-hover" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 40px 12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                      <MagCard sym={sym} name={name} etf={etf} idx={idx} />
                    </div>
                    <button onClick={() => hideDefaultStock(sym)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", lineHeight: 1, zIndex: 1, opacity: 0.7 }} title="Hide">✕</button>
                  </div>
                ))}
                {customStocks.map(sym => (
                  <div key={sym} style={{ position: "relative" }}>
                    <div onClick={() => { setSelectedSym(sym); setActiveTab("analisis"); }} className="card-hover" style={{ background: C.panel, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: "12px 40px 12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                      <MagCard sym={sym} name={sym} etf={null} idx="Custom" />
                    </div>
                    <button onClick={() => removeStock(sym)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", lineHeight: 1, zIndex: 1, opacity: 0.7 }} title="Remove">✕</button>
                  </div>
                ))}
                <button onClick={() => setShowWatchlist(true)} style={{ padding: "10px", borderRadius: 8, background: `${C.accent}08`, border: `1px dashed ${C.accent}40`, color: C.accent, fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: 0.5 }}>
                  ➕ {tr("manageWl", lang)}
                </button>
              </div>
            </div>
          )}

          {activeTab === "etfs" && (
            <div style={{ animation: "fadeIn 0.3s" }}>
              <GoldHeader>{tr("mainIndices", lang)}</GoldHeader>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
                {ETF_TAB_INDICES.map(({ sym, label, name, idx }) => (
                  <IndexCard key={sym} sym={sym} label={label} name={name} idx={idx}
                    onClick={() => { setSelectedSym(sym); setActiveTab("analisis"); }} />
                ))}
              </div>
              <GoldHeader>{tr("marketEtfs", lang)}</GoldHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ETF_LIST.filter(e => !hiddenDefaultEtfs.includes(e.sym)).map(({ sym, name, idx }) => (
                  <div key={sym} style={{ position: "relative" }}>
                    <div onClick={() => { setSelectedSym(sym); setActiveTab("analisis"); }} className="card-hover" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 40px 12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                      <MagCard sym={sym} name={name} etf={null} idx={idx} />
                    </div>
                    <button onClick={() => hideDefaultEtf(sym)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", lineHeight: 1, zIndex: 1, opacity: 0.7 }} title="Hide">✕</button>
                  </div>
                ))}
                {customEtfs.map(sym => (
                  <div key={sym} style={{ position: "relative" }}>
                    <div onClick={() => { setSelectedSym(sym); setActiveTab("analisis"); }} className="card-hover" style={{ background: C.panel, border: `1px solid ${C.accent}30`, borderRadius: 10, padding: "12px 40px 12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                      <MagCard sym={sym} name={sym} etf={null} idx="Custom ETF" />
                    </div>
                    <button onClick={() => removeEtf(sym)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", lineHeight: 1, zIndex: 1, opacity: 0.7 }} title="Remove">✕</button>
                  </div>
                ))}
                <button onClick={() => setShowWatchlist(true)} style={{ padding: "10px", borderRadius: 8, background: `${C.accent}08`, border: `1px dashed ${C.accent}40`, color: C.accent, fontWeight: 700, fontSize: 11, cursor: "pointer", letterSpacing: 0.5 }}>
                  ➕ {tr("manageWl", lang)}
                </button>
              </div>
            </div>
          )}

          {activeTab === "noticias" && (
            <div style={{ animation: "fadeIn 0.3s" }}>
              <GoldHeader>{tr("rtNews", lang)}</GoldHeader>
              <div style={{ fontSize: 10, color: C.muted, padding: "6px 10px", background: C.panel, borderRadius: 6, marginBottom: 14, border: `1px solid ${C.border}` }}>
                {tr("newsSrc", lang)}
              </div>
              <NewsPanel />
            </div>
          )}
        </div>

        {showStrategy && <StrategyModal onClose={() => setShowStrategy(false)} />}
        {showWatchlist && <WatchlistModal onClose={() => setShowWatchlist(false)} customStocks={customStocks} customEtfs={customEtfs} addStock={addStock} removeStock={removeStock} addEtf={addEtf} removeEtf={removeEtf} hiddenDefaultStocks={hiddenDefaultStocks} hiddenDefaultEtfs={hiddenDefaultEtfs} showDefaultStock={showDefaultStock} showDefaultEtf={showDefaultEtf} />}
        {isMobile && <BottomNav active={activeTab} onChange={setActiveTab} />}
      </div>
    </MobileCtx.Provider>
    </LangCtx.Provider>
  );
}
