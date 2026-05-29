import { getRange } from '@/lib/sheets';
import { getCotacoes, getCotacoesCripto } from '@/lib/brapi';

const TIPOS_COM_TICKER = ['ação', 'acao', 'fii', 'etf', 'bdr'];
const TIPOS_CRIPTO = ['cripto', 'criptomoeda', 'crypto'];

function normalizeKey(header) {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Handles R$ 9.000,00  |  9000.00  |  9000,00  |  1.150,00
function parseCurrency(val) {
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/R\$\s*/g, '')   // remove R$
    .replace(/\s/g, '')       // remove spaces
    .replace(/\./g, '')       // remove thousands separator (pt-BR uses . as thousands)
    .replace(',', '.')        // decimal comma → dot
    .trim();
  return parseFloat(cleaned) || 0;
}

/**
 * GET /api/investimentos/patrimonio
 *
 * Reads the Carteira sheet, fetches current prices from Brapi,
 * and returns the fully consolidated portfolio with:
 *   - patrimonioTotal, custoTotalGeral, ganhoTotal, ganhoPorcentagem, variacaoHoje
 *   - patrimonioPorTipo  (allocation by asset type)
 *   - ativos             (enriched asset list with current prices, gains, weights)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = await getRange('Carteira!A:L');

    if (!data || data.length < 2) {
      return res.status(200).json({
        success: true,
        patrimonioTotal: 0,
        custoTotalGeral: 0,
        ganhoTotal: 0,
        ganhoPorcentagem: 0,
        variacaoHoje: 0,
        patrimonioPorTipo: {},
        ativos: [],
      });
    }

    const [headers, ...rows] = data;
    const keys = headers.map(normalizeKey);

    // Parse all transaction rows
    const transacoes = rows
      .filter((row) => row[0])
      .map((row, idx) => {
        const obj = { rowIndex: idx + 2 };
        keys.forEach((key, i) => { obj[key] = row[i] || ''; });
        obj.quantidade  = parseCurrency(obj.quantidade);
        obj.preco_medio = parseCurrency(obj.preco_medio);
        obj.valor_atual = parseCurrency(obj.valor_atual);
        return obj;
      });

    // Renda Fixa types are kept as individual rows (each is a distinct investment).
    // Market-priced assets (Ações, FIIs, ETFs, BDRs, Cripto) are aggregated by ticker
    // so multiple purchase lots are consolidated with a weighted-average price.
    function isRendaFixa(tipo) {
      const n = tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
      return !TIPOS_COM_TICKER.includes(n) && !TIPOS_CRIPTO.includes(tipo?.toLowerCase());
    }

    const posicaoMap = new Map();
    for (const [idx, t] of transacoes.entries()) {
      // Renda Fixa: unique key per row so they never get merged
      const key = isRendaFixa(t.tipo)
        ? `__rf__${idx}`
        : `${t.ticker.toUpperCase()}__${t.tipo?.toLowerCase() || ''}`;

      if (!posicaoMap.has(key)) {
        posicaoMap.set(key, {
          ticker: t.ticker.toUpperCase(),
          tipo: t.tipo,
          categoria: t.categoria,
          observacoes: t.observacoes,
          corretora: t.corretora || '',
          vencimento: t.vencimento || '',
          taxa: t.taxa || '',
          indexador: t.indexador || '',
          // valor_atual from sheet (Renda Fixa manual update)
          valor_atual_sheet: t.valor_atual || 0,
          _custoAcumulado: 0,
          _qtdAcumulada: 0,
          data: t.data,
          compras: [],
        });
      }
      const pos = posicaoMap.get(key);
      pos._custoAcumulado += t.quantidade * t.preco_medio;
      pos._qtdAcumulada  += t.quantidade;
      pos.compras.push({ quantidade: t.quantidade, preco_medio: t.preco_medio, data: t.data });
      if (t.data && (!pos.data || t.data < pos.data)) pos.data = t.data;
      // For Renda Fixa keep the latest valor_atual (only one row anyway)
      if (t.valor_atual) pos.valor_atual_sheet = t.valor_atual;
    }

    // Build consolidated ativos list with weighted-average price
    const ativos = Array.from(posicaoMap.values()).map((pos) => ({
      ticker: pos.ticker,
      tipo: pos.tipo,
      categoria: pos.categoria,
      observacoes: pos.observacoes,
      corretora: pos.corretora,
      vencimento: pos.vencimento,
      taxa: pos.taxa,
      indexador: pos.indexador,
      valor_atual_sheet: pos.valor_atual_sheet,
      data: pos.data,
      compras: pos.compras,
      quantidade: pos._qtdAcumulada,
      preco_medio: pos._qtdAcumulada > 0 ? pos._custoAcumulado / pos._qtdAcumulada : 0,
    }));

    // Split by type
    const comTicker = ativos.filter((a) =>
      TIPOS_COM_TICKER.includes(a.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );
    const cripto = ativos.filter((a) =>
      TIPOS_CRIPTO.includes(a.tipo?.toLowerCase())
    );

    // Fetch quotes in parallel — deduplicate tickers before calling Brapi
    const [cotacoes, cotacoesCripto] = await Promise.all([
      comTicker.length > 0
        ? getCotacoes([...new Set(comTicker.map((a) => a.ticker))]).catch(() => ({}))
        : Promise.resolve({}),
      cripto.length > 0
        ? getCotacoesCripto([...new Set(cripto.map((a) => a.ticker))]).catch(() => ({}))
        : Promise.resolve({}),
    ]);

    // Enrich each asset with current price and calculated metrics
    const ativosEnriquecidos = ativos.map((ativo) => {
      const tipoNorm = ativo.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let cotacao = null;

      if (TIPOS_COM_TICKER.includes(tipoNorm)) {
        cotacao = cotacoes[ativo.ticker] || null;
      } else if (TIPOS_CRIPTO.includes(ativo.tipo?.toLowerCase())) {
        cotacao = cotacoesCripto[ativo.ticker] || null;
      }
      // Renda Fixa: use valor_atual_sheet when present, else fall back to preco_medio
      const precoAtual = cotacao?.regularMarketPrice
        ?? (ativo.valor_atual_sheet > 0 ? ativo.valor_atual_sheet / (ativo.quantidade || 1) : ativo.preco_medio);
      const valorAtual = ativo.quantidade * precoAtual;
      const custoTotal = ativo.quantidade * ativo.preco_medio;
      const ganho = valorAtual - custoTotal;
      const ganhoPercent = custoTotal > 0 ? (ganho / custoTotal) * 100 : 0;
      const variacaoDia = cotacao?.regularMarketChangePercent ?? 0;
      const variacaoDiaAbsoluta = ativo.quantidade * (cotacao?.regularMarketChange ?? 0);

      return {
        ...ativo,
        precoAtual,
        valorAtual,
        custoTotal,
        ganho,
        ganhoPercent,
        variacaoDia,
        variacaoDiaAbsoluta,
        nome: cotacao?.shortName || ativo.ticker,
        logo: cotacao?.logourl || null,
        temCotacao: !!cotacao,
      };
    });

    // Totals
    const patrimonioTotal = ativosEnriquecidos.reduce((s, a) => s + a.valorAtual, 0);
    const custoTotalGeral = ativosEnriquecidos.reduce((s, a) => s + a.custoTotal, 0);
    const ganhoTotal = patrimonioTotal - custoTotalGeral;
    const ganhoPorcentagem = custoTotalGeral > 0 ? (ganhoTotal / custoTotalGeral) * 100 : 0;
    const variacaoHoje = ativosEnriquecidos.reduce((s, a) => s + a.variacaoDiaAbsoluta, 0);

    // Allocation by tipo
    const patrimonioPorTipo = {};
    for (const a of ativosEnriquecidos) {
      const tipo = a.tipo || 'Outro';
      patrimonioPorTipo[tipo] = (patrimonioPorTipo[tipo] || 0) + a.valorAtual;
    }

    // Add portfolio weight to each asset
    const ativosComPeso = ativosEnriquecidos.map((a) => ({
      ...a,
      pesoCarteira: patrimonioTotal > 0 ? (a.valorAtual / patrimonioTotal) * 100 : 0,
    }));

    // Sort by current value descending
    ativosComPeso.sort((a, b) => b.valorAtual - a.valorAtual);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json({
      success: true,
      patrimonioTotal,
      custoTotalGeral,
      ganhoTotal,
      ganhoPorcentagem,
      variacaoHoje,
      patrimonioPorTipo,
      ativos: ativosComPeso,
    });
  } catch (error) {
    console.error('Erro na API /patrimonio:', error);
    return res.status(500).json({ success: false, error: 'Erro ao calcular patrimônio' });
  }
}
