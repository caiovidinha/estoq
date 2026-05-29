/**
 * Brapi.dev client — server-side only (never import in browser code)
 * Docs: https://brapi.dev/docs
 *
 * Provides in-memory caching (5 min TTL) to avoid hammering the API.
 */

const BRAPI_BASE = 'https://brapi.dev/api';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const _cache = {};

function getCached(key) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}

function getHeaders() {
  // eslint-disable-next-line no-undef
  const token = process.env.BRAPI_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch market quotes for stocks, FIIs, ETFs, BDRs.
 * Returns a map: { TICKER: quoteObject }
 *
 * quoteObject fields (relevant ones):
 *   symbol, shortName, regularMarketPrice, regularMarketChange,
 *   regularMarketChangePercent, marketCap, logourl
 *
 * @param {string[]} tickers  e.g. ['PETR4', 'MXRF11']
 * @returns {Object<string, Object>}
 */
export async function getCotacoes(tickers) {
  if (!tickers || tickers.length === 0) return {};

  const sorted = [...tickers].map((t) => t.toUpperCase()).sort();
  const key = `quote:${sorted.join(',')}`;
  const hit = getCached(key);
  if (hit) return hit;

  const url = `${BRAPI_BASE}/quote/${sorted.join(',')}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`Brapi /quote error: ${res.status}`);

  const json = await res.json();
  const map = {};
  if (Array.isArray(json.results)) {
    for (const q of json.results) {
      map[q.symbol] = q;
    }
  }

  setCache(key, map);
  return map;
}

/**
 * Fetch detailed quotes with fundamental data modules.
 * Includes: summaryProfile (sector/industry), defaultKeyStatistics (P/L, P/VP, beta),
 *           financialData (ROE, ROA, margens), dividendsData (DY, últimos dividendos).
 *
 * Returns a map: { TICKER: quoteObject }
 *
 * @param {string[]} tickers
 * @returns {Object<string, Object>}
 */
export async function getCotacoesDetalhadas(tickers) {
  if (!tickers || tickers.length === 0) return {};

  const sorted = [...tickers].map((t) => t.toUpperCase()).sort();
  const key = `detailed:${sorted.join(',')}`;
  const hit = getCached(key);
  if (hit) return hit;

  const modules = [
    'summaryProfile',
    'defaultKeyStatistics',
    'financialData',
    'balanceSheetHistory',
    'incomeStatementHistory',
    'cashflowHistory',
  ].join(',');
  const url = `${BRAPI_BASE}/quote/${sorted.join(',')}?modules=${modules}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`Brapi /quote (detailed) error: ${res.status}`);

  const json = await res.json();
  const map = {};
  if (Array.isArray(json.results)) {
    for (const q of json.results) {
      map[q.symbol] = q;
    }
  }

  setCache(key, map);
  return map;
}

/**
 * Fetch crypto quotes.
 * Returns a map: { COIN: coinObject }
 *
 * coinObject fields:
 *   coin, regularMarketPrice, regularMarketChange, regularMarketChangePercent
 *
 * @param {string[]} coins  e.g. ['BTC', 'ETH']
 * @returns {Object<string, Object>}
 */
export async function getCotacoesCripto(coins) {
  if (!coins || coins.length === 0) return {};

  const sorted = [...coins].map((c) => c.toUpperCase()).sort();
  const key = `cripto:${sorted.join(',')}`;
  const hit = getCached(key);
  if (hit) return hit;

  const url = `${BRAPI_BASE}/v2/crypto?coin=${sorted.join(',')}`;
  const res = await fetch(url, { headers: getHeaders() });

  if (!res.ok) throw new Error(`Brapi /crypto error: ${res.status}`);

  const json = await res.json();
  const map = {};
  if (Array.isArray(json.coins)) {
    for (const c of json.coins) {
      map[c.coin] = c;
    }
  }

  setCache(key, map);
  return map;
}
