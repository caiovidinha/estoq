import { getRange, parseSheetData, filterAndSortMovimentacoes } from '@/lib/sheets';

/**
 * API Route: /api/movimentacoes
 * 
 * Query params:
 * - situacao: "Paga" | "Recebida" | "Pago,Recebido"
 * - tipo: "Receita" | "Despesa"
 * - mes: nome do mês (ex: "Janeiro")
 * - conta: nome da conta
 * - tipoConta: "debito" | "credito" | "todos" (default: "debito")
 * - limit: número máximo de resultados
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const tipoConta = req.query.tipoConta || 'debito';
    let todasMovimentacoes = [];

    // Busca transações de débito (Extrato)
    if (tipoConta === 'debito' || tipoConta === 'todos') {
      const rawDataDebito = await getRange('Extrato!A:I');
      const movimentacoesDebito = parseSheetData(rawDataDebito).map(mov => ({
        ...mov,
        tipoConta: 'Débito'
      }));
      todasMovimentacoes = [...todasMovimentacoes, ...movimentacoesDebito];
    }

    // Busca transações de crédito (Extrato Crédito)
    if (tipoConta === 'credito' || tipoConta === 'todos') {
      const rawDataCredito = await getRange('Extrato Crédito!A:H');
      const movimentacoesCredito = parseSheetData(rawDataCredito).map(mov => {
        // Se não tem conta definida, usa o nome do cartão (coluna H)
        const conta = mov.conta || mov.cartão || 'Crédito';
        // Normaliza o campo mês: pode vir como "fatura" no Extrato Crédito
        const mes = mov['mês'] || mov['mes'] || mov['fatura'] || '';
        return {
          ...mov,
          'mês': mes,
          conta: conta,
          tipoConta: 'Crédito'
        };
      });
      todasMovimentacoes = [...todasMovimentacoes, ...movimentacoesCredito];
    }

    // Busca transações de VR (Extrato VR)
    if (tipoConta === 'vr' || tipoConta === 'todos') {
      const rawDataVR = await getRange('Extrato VR!A:G');
      const movimentacoesVR = parseSheetData(rawDataVR).map(mov => ({
        ...mov,
        conta: 'Vale Benefícios',
        tipoConta: 'VR',
      }));
      todasMovimentacoes = [...todasMovimentacoes, ...movimentacoesVR];
    }

    // Prepara filtros
    const filters = {
      situacao: req.query.situacao ? req.query.situacao.split(',') : ['Paga', 'Recebida'],
      tipo: req.query.tipo || null,
      mes: req.query.mes || null,
      conta: req.query.conta || null,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
    };

    // Filtra e ordena
    const resultado = filterAndSortMovimentacoes(todasMovimentacoes, filters);

    // Cache mais curto quando há filtro de tipoConta
    const cacheTime = tipoConta === 'todos' ? 's-maxage=30' : 's-maxage=10';
    res.setHeader('Cache-Control', `${cacheTime}, stale-while-revalidate`);
    
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
