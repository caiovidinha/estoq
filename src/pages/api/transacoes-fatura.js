import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/transacoes-fatura
 * Retorna transações de crédito filtradas por cartão e mês
 * 
 * Query params:
 * - cartao: nome do cartão (ex: "Nubank Caio")
 * - mes: número do mês (ex: "01", "02", etc)
 */
export default async function handler(req, res) {
  // Cache de 30 segundos
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cartao, mes } = req.query;

  if (!cartao || !mes) {
    return res.status(400).json({ 
      success: false,
      error: 'Parâmetros "cartao" e "mes" são obrigatórios' 
    });
  }

  try {
    // Busca todas as transações de crédito
    // A:H = Data, Tipo, Descritivo, Valor, Mês, Detalhes, Situação, Cartão
    const transacoesData = await getRange('Extrato Crédito!A:H');
    const transacoes = parseSheetData(transacoesData);
    
    // Filtra por cartão e mês
    const transacoesFiltradas = transacoes.filter(transacao => {
      const mesTransacao = transacao.mês?.substring(0, 2);
      const cartaoTransacao = transacao.cartão;
      
      // Comparação case-insensitive e trimmed
      return mesTransacao === mes && cartaoTransacao?.toLowerCase().trim() === cartao?.toLowerCase().trim();
    });

    // Ordena por data (mais recente primeiro)
    transacoesFiltradas.sort((a, b) => {
      const dataA = a.data || '';
      const dataB = b.data || '';
      return dataB.localeCompare(dataA);
    });

    // Calcula total da fatura
    const totalFatura = transacoesFiltradas.reduce((acc, transacao) => {
      if (transacao.tipo?.toLowerCase() === 'despesa') {
        const valorStr = transacao.valor || 'R$ 0,00';
        const valor = parseFloat(
          valorStr
            .replace('R$', '')
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
        ) || 0;
        return acc + valor;
      }
      return acc;
    }, 0);

    return res.status(200).json({
      success: true,
      count: transacoesFiltradas.length,
      cartao,
      mes,
      totalFatura,
      totalFaturaFormatado: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(totalFatura),
      data: transacoesFiltradas
    });

  } catch (error) {
    console.error('Erro na API /transacoes-fatura:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar transações',
      details: error.message
    });
  }
}
