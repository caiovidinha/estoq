import { getRange } from '@/lib/sheets';
import { getCotacoesDetalhadas, getCotacoes } from '@/lib/brapi';

function parseCurrency(val) {
  if (!val) return 0;
  return (
    parseFloat(
      String(val)
        .replace(/R\$\s*/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim()
    ) || 0
  );
}

function normalizeKey(h) {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

const TIPOS_COM_TICKER = ['ação', 'acao', 'fii', 'etf', 'bdr'];

/** Extract numeric value from Brapi's {raw, fmt} object or plain number */
const r = (v) => (v != null && typeof v === 'object' && 'raw' in v ? v.raw : (v ?? null));

/** Convert Brapi quote object to a rich ativo record */
function buildAtivo(ticker, q, extra = {}) {
  const stats   = q.defaultKeyStatistics || {};
  const profile = q.summaryProfile       || {};
  const fin     = q.financialData        || {};

  const norm = (raw, threshold = 1) =>
    raw != null ? (Math.abs(raw) < threshold ? raw * 100 : raw) : null;

  // DY: dividendsData not in plan — use defaultKeyStatistics fields
  const dy    = norm(stats.dividendYield ?? stats.yield ?? q.dividendYield ?? null);
  const roe   = norm(fin.returnOnEquity   ?? null);
  const roa   = norm(fin.returnOnAssets   ?? null);
  const margem = norm(fin.profitMargins   ?? null);
  const margemOp = norm(fin.operatingMargins ?? null);
  const crescLucro   = norm(fin.earningsGrowth  ?? null);
  const crescReceita = norm(fin.revenueGrowth   ?? null);

  // Debt/Equity can be 100-based in Brapi (e.g., 150 = 1.5x)
  const deRaw = fin.debtToEquity ?? null;
  const de = deRaw != null ? (deRaw > 10 ? deRaw / 100 : deRaw) : null;

  // ── Cash flow (cashflowHistory — direct array) ──────────────────────────
  const cf0    = Array.isArray(q.cashflowHistory) ? (q.cashflowHistory[0] || {}) : {};
  const cf1    = Array.isArray(q.cashflowHistory) ? (q.cashflowHistory[1] || {}) : {};
  // Brapi already computes freeCashFlow; fall back to operatingCashFlow + investmentCashFlow
  const fcfAbs  = cf0.freeCashFlow ?? (cf0.operatingCashFlow != null ? cf0.operatingCashFlow + (cf0.investmentCashFlow ?? 0) : null);
  const fcfAbs1 = cf1.freeCashFlow ?? (cf1.operatingCashFlow != null ? cf1.operatingCashFlow + (cf1.investmentCashFlow ?? 0) : null);
  const mktCap  = q.marketCap ?? null;
  const fcfYield = fcfAbs != null && mktCap != null && mktCap > 0
    ? (fcfAbs / mktCap) * 100 : null;
  const sharesOut = (stats.sharesOutstanding ?? stats.impliedSharesOutstanding) ?? null;
  const fcfPerShare = fcfAbs != null && sharesOut != null && sharesOut > 0
    ? fcfAbs / sharesOut : null;
  const pFcf = q.regularMarketPrice != null && fcfPerShare != null && fcfPerShare > 0
    ? q.regularMarketPrice / fcfPerShare : null;
  const crescFCF = fcfAbs != null && fcfAbs1 != null && fcfAbs1 !== 0
    ? ((fcfAbs - fcfAbs1) / Math.abs(fcfAbs1)) * 100 : null;

  // ── Balance sheet (balanceSheetHistory — direct array) ─────────────────
  const bs0      = Array.isArray(q.balanceSheetHistory) ? (q.balanceSheetHistory[0] || {}) : {};
  const cashBs   = (bs0.cash ?? 0) + (bs0.shortTermInvestments ?? 0) || null;
  const debtBs   = (bs0.longTermDebt ?? 0) + (bs0.shortLongTermDebt ?? 0) || null;
  const netDebt  = debtBs != null && cashBs != null ? debtBs - cashBs : null;
  const ebitdaFin = fin.ebitda ?? null;
  const netDebtEbitda = netDebt != null && ebitdaFin != null && ebitdaFin > 0
    ? netDebt / ebitdaFin : null;

  // ── Income statement (incomeStatementHistory — direct array) ───────────
  const is0 = Array.isArray(q.incomeStatementHistory) ? (q.incomeStatementHistory[0] || {}) : {};
  const is1 = Array.isArray(q.incomeStatementHistory) ? (q.incomeStatementHistory[1] || {}) : {};
  const rev0 = is0.totalRevenue ?? null;
  const rev1 = is1.totalRevenue ?? null;
  const crescReceitaIS = rev0 != null && rev1 != null && rev1 !== 0
    ? ((rev0 - rev1) / Math.abs(rev1)) * 100 : null;
  // prefer financialData (TTM) over annual statement if available
  const crescReceitaFinal = norm(fin.revenueGrowth ?? null) ?? crescReceitaIS ?? crescReceita;

  return {
    ticker,
    nome:      q.shortName  || q.longName || ticker,
    tipo:      extra.tipo   || '',
    preco:     q.regularMarketPrice         ?? null,
    varDia:    q.regularMarketChangePercent ?? null,
    varAbs:    q.regularMarketChange        ?? null,
    abertura:  q.regularMarketOpen          ?? null,
    maxDia:    q.regularMarketDayHigh       ?? null,
    minDia:    q.regularMarketDayLow        ?? null,
    high52w:   q.fiftyTwoWeekHigh           ?? null,
    low52w:    q.fiftyTwoWeekLow            ?? null,
    volume:    q.regularMarketVolume        ?? null,
    volumeMed: q.averageDailyVolume3Month   ?? null,
    marketCap: q.marketCap                  ?? null,
    // Valuation
    pl:       stats.trailingPE   ?? q.priceEarnings ?? null,
    plFwd:    stats.forwardPE    ?? null,
    pvp:      stats.priceToBook  ?? null,
    evEbitda: stats.enterpriseToEbitda ?? null,
    dy,
    // Cash flow & debt
    fcfYield,
    pFcf,
    crescFCF,
    netDebt,
    netDebtEbitda,
    // Profitability
    roe,
    roa,
    margem,
    margemOp,
    ebitda: ebitdaFin,
    // Growth
    crescLucro,
    crescReceita: crescReceitaFinal,
    // Risk
    beta: stats.beta ?? null,
    de,
    currentRatio: fin.currentRatio ?? null,
    // Analyst consensus
    recomendacao:  fin.recommendationKey       ?? null,
    precoAlvo:     fin.targetMeanPrice         ?? null,
    precoAlvoMax:  fin.targetHighPrice         ?? null,
    precoAlvoMin:  fin.targetLowPrice          ?? null,
    numAnalistas:  fin.numberOfAnalystOpinions ?? null,
    // Company info
    setor:     profile.sector               || null,
    industria: profile.industry             || null,
    descricao: profile.longBusinessSummary  || null,
    logo:      q.logourl                    || null,
    // Portfolio context
    custo: extra.custo || 0,
  };
}

/** Fetch with automatic fallback: try detailed modules, fall back to basic /quote */
async function fetchCotacoes(tickers) {
  try {
    return await getCotacoesDetalhadas(tickers);
  } catch (err) {
    // 403 = modules endpoint requires paid plan; fall back to basic quotes
    if (err.message && err.message.includes('403')) {
      return getCotacoes(tickers);
    }
    throw err;
  }
}

/**
 * GET /api/investimentos/valuation
 *   ?search=TICKER  → single ticker full breakdown (any ticker, not just in portfolio)
 *   (no params)     → all market assets in portfolio
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { search } = req.query;

    // ── Single ticker search ──────────────────────────────────────────────
    if (search) {
      const ticker = search.toUpperCase().trim();
      const cotacoes = await fetchCotacoes([ticker]);
      const q = cotacoes[ticker];
      if (!q) {
        return res.status(404).json({ success: false, error: `Ticker "${ticker}" não encontrado na Brapi` });
      }
      return res.status(200).json({ success: true, ativo: buildAtivo(ticker, q) });
    }

    // ── Portfolio tickers ─────────────────────────────────────────────────
    const data = await getRange('Carteira!A:L');
    if (!data || data.length < 2) {
      return res.status(200).json({ success: true, ativos: [] });
    }

    const [headers, ...rows] = data;
    const keys = headers.map(normalizeKey);

    const ativos = rows.filter((r) => r[0]).map((row) => {
      const obj = {};
      keys.forEach((k, i) => { obj[k] = row[i] || ''; });
      obj.preco_medio = parseCurrency(obj.preco_medio);
      obj.quantidade  = parseCurrency(obj.quantidade);
      return obj;
    });

    const comTicker = ativos.filter((a) =>
      TIPOS_COM_TICKER.includes(
        (a.tipo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

    const tickers = [...new Set(comTicker.map((a) => a.ticker.toUpperCase()))].filter(Boolean);
    if (tickers.length === 0) return res.status(200).json({ success: true, ativos: [] });

    const cotacoes = await fetchCotacoes(tickers);

    const custoMap = {};
    for (const a of comTicker) {
      const t = a.ticker.toUpperCase();
      custoMap[t] = (custoMap[t] || 0) + a.quantidade * a.preco_medio;
    }

    const result = tickers.map((ticker) => {
      const q = cotacoes[ticker] || {};
      const tipoAtivo = comTicker.find((a) => a.ticker.toUpperCase() === ticker);
      return buildAtivo(ticker, q, { tipo: tipoAtivo?.tipo || '', custo: custoMap[ticker] || 0 });
    });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ success: true, ativos: result });
  } catch (err) {
    console.error('Valuation API error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
