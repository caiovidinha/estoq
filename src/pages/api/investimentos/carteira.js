import { getRange } from '@/lib/sheets';

const RANGE = 'Carteira!A:G';

/** Remove accents and normalize a sheet header to a clean key */
function normalizeKey(header) {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * GET /api/investimentos/carteira
 * Reads the "Carteira" sheet.
 * Expected headers (row 1): Ticker | Tipo | Quantidade | Preço Médio | Data | Categoria | Observações
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = await getRange(RANGE);

    if (!data || data.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const [headers, ...rows] = data;
    const keys = headers.map(normalizeKey);
    // Expected normalized keys: ticker, tipo, quantidade, preco_medio, data, categoria, observacoes

    const ativos = rows
      .filter((row) => row[0]) // skip empty rows
      .map((row, idx) => {
        const obj = { rowIndex: idx + 2 };
        keys.forEach((key, i) => {
          obj[key] = row[i] || '';
        });

        // Normalize numeric fields (handle both "." and "," as decimal)
        obj.quantidade = parseFloat(String(obj.quantidade).replace(',', '.')) || 0;
        obj.preco_medio = parseFloat(String(obj.preco_medio || '').replace(',', '.')) || 0;

        return obj;
      });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).json({ success: true, data: ativos });
  } catch (error) {
    console.error('Erro ao buscar carteira:', error);
    return res.status(500).json({ success: false, error: 'Erro ao buscar carteira' });
  }
}
