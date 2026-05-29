/* global process */
import OpenAI from 'openai';
import { getRange } from '@/lib/sheets';
import { getCotacoes, getCotacoesCripto, getCotacoesDetalhadas } from '@/lib/brapi';

// Groq: OpenAI-compatible endpoint — free tier, muito rápido
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const TIPOS_COM_TICKER = ['ação', 'acao', 'fii', 'etf', 'bdr'];
const TIPOS_CRIPTO = ['cripto', 'criptomoeda', 'crypto'];

function parseCurrency(val) {
  if (!val) return 0;
  return parseFloat(
    String(val).replace(/R\$\s*/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.').trim()
  ) || 0;
}

function normalizeKey(h) {
  return h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Extract tickers-like tokens from user message (uppercase 4-6 char, or known crypto)
function extractMentionedTickers(message) {
  const upper = message.toUpperCase();
  const matches = upper.match(/\b[A-Z]{3,6}[0-9]{0,2}\b/g) || [];
  return [...new Set(matches)];
}

/**
 * Read investor profile from the "Perfil" sheet tab (A:B key/value pairs).
 * Falls back to a generic description if the sheet doesn't exist.
 */
async function getInvestorProfile() {
  try {
    const data = await getRange('Perfil!A:B');
    if (!data || data.length < 2) return null;

    const pairs = data
      .filter((row) => row[0] && row[1])
      .map((row) => `- ${row[0]}: ${row[1]}`);

    return pairs.length > 0 ? pairs.join('\n') : null;
  } catch {
    return null;
  }
}

async function getPortfolioSummary() {
  try {
    const data = await getRange('Carteira!A:L');
    if (!data || data.length < 2) return 'Carteira vazia.';

    const [headers, ...rows] = data;
    const keys = headers.map(normalizeKey);

    const ativos = rows.filter((r) => r[0]).map((row) => {
      const obj = {};
      keys.forEach((k, i) => { obj[k] = row[i] || ''; });
      obj.quantidade  = parseCurrency(obj.quantidade);
      obj.preco_medio = parseCurrency(obj.preco_medio);
      obj.valor_atual = parseCurrency(obj.valor_atual);
      return obj;
    });

    // Fetch current prices for market assets
    const comTicker = ativos.filter((a) =>
      TIPOS_COM_TICKER.includes(a.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );
    const cripto = ativos.filter((a) => TIPOS_CRIPTO.includes(a.tipo?.toLowerCase()));

    const [cotacoes, cotacoesCripto] = await Promise.all([
      comTicker.length > 0
        ? getCotacoes([...new Set(comTicker.map((a) => a.ticker.toUpperCase()))]).catch(() => ({}))
        : Promise.resolve({}),
      cripto.length > 0
        ? getCotacoesCripto([...new Set(cripto.map((a) => a.ticker.toUpperCase()))]).catch(() => ({}))
        : Promise.resolve({}),
    ]);

    const linhas = ativos.map((a) => {
      const tipoNorm = a.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let cotacao = null;
      if (TIPOS_COM_TICKER.includes(tipoNorm)) cotacao = cotacoes[a.ticker.toUpperCase()] || null;
      else if (TIPOS_CRIPTO.includes(a.tipo?.toLowerCase())) cotacao = cotacoesCripto[a.ticker.toUpperCase()] || null;

      const precoAtual = cotacao?.regularMarketPrice ?? (a.valor_atual > 0 ? a.valor_atual / (a.quantidade || 1) : a.preco_medio);
      const valorAtual = a.quantidade * precoAtual;
      const custoTotal = a.quantidade * a.preco_medio;
      const ganho = valorAtual - custoTotal;
      const ganhoPercent = custoTotal > 0 ? ((ganho / custoTotal) * 100).toFixed(1) : '0';

      return `- ${a.ticker} (${a.tipo}): ${a.quantidade} cotas, PM R$${a.preco_medio.toFixed(2)}, Atual R$${precoAtual.toFixed(2)}, Valor R$${valorAtual.toFixed(2)}, Ganho ${ganhoPercent}%${a.vencimento ? `, vence ${a.vencimento}` : ''}${a.taxa ? `, taxa ${a.taxa}` : ''}${a.indexador ? ` ${a.indexador}` : ''}`;
    });

    const total = ativos.reduce((s, a) => {
      const tipoNorm = a.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let cotacao = TIPOS_COM_TICKER.includes(tipoNorm) ? cotacoes[a.ticker.toUpperCase()] : null;
      const precoAtual = cotacao?.regularMarketPrice ?? (a.valor_atual > 0 ? a.valor_atual / (a.quantidade || 1) : a.preco_medio);
      return s + a.quantidade * precoAtual;
    }, 0);

    return `Patrimônio total: R$${total.toFixed(2)}\n\nAtivos:\n${linhas.join('\n')}`;
  } catch {
    return 'Não foi possível carregar a carteira.';
  }
}

async function getQuotesForMessage(message) {
  const tickers = extractMentionedTickers(message);
  if (tickers.length === 0) return '';

  try {
    const quotes = await getCotacoesDetalhadas(tickers).catch(() => ({}));
    const entries = Object.values(quotes);
    if (entries.length === 0) return '';

    const linhas = entries.map((q) => {
      const stats = q.defaultKeyStatistics || {};
      const profile = q.summaryProfile || {};
      const fin = q.financialData || {};
      const divs = q.dividendsData || {};

      const pl   = stats.trailingPE    ?? q.priceEarnings      ?? null;
      const pvp  = stats.priceToBook   ?? null;
      const beta = stats.beta          ?? null;
      const roe  = fin.returnOnEquity  ?? null;
      const dy   = divs.yield          ?? q.dividendYield       ?? null;

      const fundamentals = [
        pl   != null ? `P/L ${pl.toFixed(1)}`              : null,
        pvp  != null ? `P/VP ${pvp.toFixed(2)}`            : null,
        dy   != null ? `DY ${(dy * (dy < 1 ? 100 : 1)).toFixed(2)}%` : null,
        roe  != null ? `ROE ${(roe * 100).toFixed(1)}%`    : null,
        beta != null ? `Beta ${beta.toFixed(2)}`            : null,
      ].filter(Boolean).join(', ') || 'fundamentais não disponíveis';

      const setor = [profile.sector, profile.industry].filter(Boolean).join(' / ') || null;

      return [
        `- ${q.symbol} (${q.shortName || q.symbol}):`,
        `  Preço R$${q.regularMarketPrice?.toFixed(2)}, Dia ${q.regularMarketChangePercent?.toFixed(2)}%`,
        `  Fundamentais: ${fundamentals}`,
        setor ? `  Setor: ${setor}` : null,
      ].filter(Boolean).join('\n');
    });

    return `\nCotações e fundamentais dos ativos mencionados:\n${linhas.join('\n')}`;
  } catch {
    return '';
  }
}

const SYSTEM_PROMPT = `Você é um assistente especialista em investimentos brasileiro, direto e objetivo.
Você tem acesso à carteira completa do usuário, ao perfil de investidor dele e a cotações em tempo real via Brapi.

Diretrizes:
- Responda sempre em português do Brasil
- Seja conciso mas completo; use bullet points quando útil
- SEMPRE leve em conta o perfil de investidor (objetivo, horizonte, tolerância ao risco) ao dar recomendações
- Base suas análises nos dados reais da carteira e cotações fornecidos — não diga "não tenho acesso", você tem
- Se um ativo for mencionado e os dados fundamentais estiverem disponíveis (P/L, DY, P/VP, etc.), use-os
- Para ETFs e fundos de índice, compare a variação diária/histórica e composição quando relevante
- Mencione riscos e considere a diversificação atual da carteira
- Não faça promessas de retorno; use linguagem como "historicamente", "tende a", "pode"
- Para renda fixa, considere o contexto de taxa Selic e CDI`;

/**
 * POST /api/investimentos/chat
 * Body: { message: string, history: [{role, content}] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Mensagem vazia' });
  if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY não configurada' });

  try {
    const [portfolioSummary, quotesContext, investorProfile] = await Promise.all([
      getPortfolioSummary(),
      getQuotesForMessage(message),
      getInvestorProfile(),
    ]);

    const profileSection = investorProfile
      ? `\n=== PERFIL DO INVESTIDOR ===\n${investorProfile}\n=== FIM DO PERFIL ===\n`
      : '';

    const systemContent = `${SYSTEM_PROMPT}
${profileSection}
=== CARTEIRA ATUAL DO USUÁRIO ===
${portfolioSummary}
${quotesContext}
=== FIM DOS DADOS ===`;

    const messages = [
      { role: 'system', content: systemContent },
      // Include recent history (last 6 messages to save tokens)
      ...history.slice(-6),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 800,
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta.';
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Erro no chat IA:', error);
    return res.status(500).json({ success: false, error: 'Erro ao processar pergunta' });
  }
}
