import { getRange } from '@/lib/sheets';
import { getCotacoes, getCotacoesCripto } from '@/lib/brapi';
import { tipoParaCategoria } from '@/utils/tipoMapping';

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

function normalizeTipo(tipo) {
  return (tipo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const TIPOS_COM_TICKER = ['ação', 'acao', 'fii', 'etf', 'bdr'];
const TIPOS_CRIPTO = ['cripto', 'criptomoeda', 'crypto'];

/**
 * GET /api/investimentos/rebalanceamento
 * Returns current allocation vs target allocation from "Alocacao" sheet.
 *
 * Alocacao sheet format (A:B):
 *   Tipo      | % Alvo
 *   Ação      | 40
 *   FII       | 25
 *   ...
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    // --- 1. Load target allocations ---
    let alvos = {};
    try {
      const alocData = await getRange('Alocacao!A:B');
      if (alocData && alocData.length > 1) {
        const [, ...alocRows] = alocData;
        for (const row of alocRows) {
          if (row[0] && row[1]) {
            alvos[row[0].trim()] = parseCurrency(row[1]);
          }
        }
      }
    } catch {
      // Sheet doesn't exist — proceed without targets
    }

    // --- 2. Load current portfolio ---
    const carteiraData = await getRange('Carteira!A:L');
    if (!carteiraData || carteiraData.length < 2) {
      return res.status(200).json({
        success: true,
        alocacaoAtual: {},
        alvos,
        patrimonioTotal: 0,
        patrimonioPorTipo: {},
        recomendacoes: [],
        temAlvo: Object.keys(alvos).length > 0,
      });
    }

    const [headers, ...rows] = carteiraData;
    const keys = headers.map(normalizeKey);

    const ativos = rows
      .filter((r) => r[0])
      .map((row) => {
        const obj = {};
        keys.forEach((k, i) => { obj[k] = row[i] || ''; });
        obj.quantidade  = parseCurrency(obj.quantidade);
        obj.preco_medio = parseCurrency(obj.preco_medio);
        obj.valor_atual = parseCurrency(obj.valor_atual);
        return obj;
      });

    // --- 3. Fetch current prices ---
    const comTicker = ativos.filter((a) => TIPOS_COM_TICKER.includes(normalizeTipo(a.tipo)));
    const cripto    = ativos.filter((a) => TIPOS_CRIPTO.includes(normalizeTipo(a.tipo)));

    const [cotacoes, cotacoesCripto] = await Promise.all([
      comTicker.length > 0
        ? getCotacoes([...new Set(comTicker.map((a) => a.ticker.toUpperCase()))]).catch(() => ({}))
        : Promise.resolve({}),
      cripto.length > 0
        ? getCotacoesCripto([...new Set(cripto.map((a) => a.ticker.toUpperCase()))]).catch(() => ({}))
        : Promise.resolve({}),
    ]);

    // --- 4. Compute value per asset category (mapped) ---
    const patrimonioPorCategoria = {};
    let total = 0;

    for (const a of ativos) {
      const tipoNorm = normalizeTipo(a.tipo);
      let precoAtual = a.preco_medio;

      if (TIPOS_COM_TICKER.includes(tipoNorm)) {
        precoAtual = cotacoes[a.ticker.toUpperCase()]?.regularMarketPrice ?? a.preco_medio;
      } else if (TIPOS_CRIPTO.includes(tipoNorm)) {
        precoAtual = cotacoesCripto[a.ticker.toUpperCase()]?.regularMarketPrice ?? a.preco_medio;
      } else if (a.valor_atual > 0) {
        // Renda Fixa: valor_atual is the full position value
        precoAtual = a.valor_atual / (a.quantidade || 1);
      }

      const valorAtual = a.quantidade * precoAtual;
      total += valorAtual;

      // Map raw tipo → canonical allocation category
      const categoria = tipoParaCategoria(a.tipo);
      patrimonioPorCategoria[categoria] = (patrimonioPorCategoria[categoria] || 0) + valorAtual;
    }

    // Percentage allocation by category
    const alocacaoAtual = {};
    for (const [cat, valor] of Object.entries(patrimonioPorCategoria)) {
      alocacaoAtual[cat] = total > 0 ? (valor / total) * 100 : 0;
    }

    // --- 5. Build recommendations ---
    const recomendacoes = [];
    const temAlvo = Object.keys(alvos).length > 0;

    if (temAlvo) {
      const allTypes = [...new Set([...Object.keys(alocacaoAtual), ...Object.keys(alvos)])];

      for (const tipo of allTypes) {
        const atualPct = alocacaoAtual[tipo] || 0;
        const alvoPct  = alvos[tipo] || 0;
        const diffPct  = alvoPct - atualPct;

        let status = 'ok';
        if (Math.abs(diffPct) >= 2) status = diffPct > 0 ? 'subponderado' : 'superponderado';

        recomendacoes.push({
          tipo,
          atualPct,
          alvoPct,
          diffPct,
          valorAtual: patrimonioPorCategoria[tipo] || 0,
          status,
        });
      }

      // Sort: most underweight first
      recomendacoes.sort((a, b) => b.diffPct - a.diffPct);
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({
      success: true,
      alocacaoAtual,
      alvos,
      patrimonioTotal: total,
      patrimonioPorTipo: patrimonioPorCategoria,   // kept same key for front-end compatibility
      recomendacoes,
      temAlvo,
    });
  } catch (err) {
    console.error('Rebalanceamento API error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
