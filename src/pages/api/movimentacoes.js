import { getRange, parseSheetData, filterAndSortMovimentacoes } from '@/lib/sheets';

/**
 * API Route: /api/movimentacoes
 * 
 * Query params:
 * - situacao: "Paga" | "Recebida" | "Pago,Recebido"
 * - tipo: "Receita" | "Despesa"
 * - mes: nome do mês (ex: "Janeiro")
 * - conta: nome da conta
 * - limit: número máximo de resultados
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Busca dados da planilha: Extrato!A:H
    const rawData = await getRange('Extrato!A:H');
    
    // Converte para array de objetos
    const movimentacoes = parseSheetData(rawData);

    // Prepara filtros
    const filters = {
      situacao: req.query.situacao ? req.query.situacao.split(',') : ['Paga', 'Recebida'],
      tipo: req.query.tipo || null,
      mes: req.query.mes || null,
      conta: req.query.conta || null,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
    };

    // Filtra e ordena
    const resultado = filterAndSortMovimentacoes(movimentacoes, filters);

    // Cache por 30 segundos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: resultado.length,
      data: resultado,
    });

  } catch (error) {
    console.error('Erro na API /movimentacoes:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar movimentações' 
    });
  }
}
