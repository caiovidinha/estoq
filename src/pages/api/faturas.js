import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/faturas
 * Retorna as faturas dos cartões de crédito
 * 
 * Query params:
 * - mes: número do mês (ex: "01", "02", etc) - opcional
 * - status: "Pago", "A pagar" - opcional
 */
export default async function handler(req, res) {
  // Cache de 30 segundos
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mes, status } = req.query;

  try {
    // Busca dados da planilha Faturas
    const rawData = await getRange('Faturas!A:E');
    const faturas = parseSheetData(rawData);

    // Filtra por mês se especificado
    let faturasFiltradas = faturas;
    
    if (mes) {
      faturasFiltradas = faturas.filter(fatura => {
        // Mês está no formato "01 - JANEIRO", pega só os primeiros 2 dígitos
        const mesFatura = fatura.mês?.substring(0, 2);
        return mesFatura === mes;
      });
    }

    // Filtra por status se especificado
    if (status) {
      faturasFiltradas = faturasFiltradas.filter(fatura => 
        fatura.status?.toLowerCase() === status.toLowerCase()
      );
    }

    // Ordena por vencimento (mais próximo primeiro)
    faturasFiltradas.sort((a, b) => {
      const dateA = parseDate(a.vencimento);
      const dateB = parseDate(b.vencimento);
      if (!dateA || !dateB) return 0;
      return dateA - dateB;
    });

    return res.status(200).json({
      success: true,
      count: faturasFiltradas.length,
      data: faturasFiltradas,
    });

  } catch (error) {
    console.error('Erro na API /faturas:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar faturas',
      details: error.message
    });
  }
}

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const [dia, mes, ano] = dateStr.split('/');
  if (!dia || !mes || !ano) return null;
  
  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
}
