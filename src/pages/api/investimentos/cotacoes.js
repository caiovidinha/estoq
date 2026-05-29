import { getCotacoes, getCotacoesCripto } from '@/lib/brapi';

/**
 * GET /api/investimentos/cotacoes?tickers=PETR4,MXRF11&tipo=acao
 * GET /api/investimentos/cotacoes?tickers=BTC,ETH&tipo=cripto
 *
 * Client-facing proxy to Brapi. Caching is handled in lib/brapi.js.
 * Never call Brapi directly from the browser — use this route.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { tickers, tipo } = req.query;

  if (!tickers) {
    return res.status(400).json({ error: 'Parâmetro "tickers" é obrigatório' });
  }

  const tickerList = tickers
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (tickerList.length === 0) {
    return res.status(400).json({ error: 'Nenhum ticker válido fornecido' });
  }

  try {
    const data =
      tipo === 'cripto'
        ? await getCotacoesCripto(tickerList)
        : await getCotacoes(tickerList);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar cotações' });
  }
}
