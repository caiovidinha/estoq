import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/limites-cartoes
 * Retorna os limites restantes de cada cartão (limite - fatura do mês)
 * 
 * Query params:
 * - mes: número do mês (ex: "01", "02", etc) - opcional, padrão: mês atual
 * 
 * Cálculo:
 * - Considera apenas faturas com status "A pagar"
 * - Para cada cartão: limiteRestante = Math.max(0, limite - fatura)
 * - Total: soma de todos os limites restantes individuais
 */
export default async function handler(req, res) {
  // Cache de 30 segundos
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mes } = req.query;
  
  // Usa mês atual se não especificado
  const mesAtual = mes || String(new Date().getMonth() + 1).padStart(2, '0');

  try {
    // Busca cartões (A2:B) - Nome e Limite
    const cartoesData = await getRange('Cartões!A2:B');
    
    // Busca faturas do mês (incluindo status)
    const faturasData = await getRange('Faturas!A:E'); // Cartão, Mês, Valor, Status, Vencimento
    const faturas = parseSheetData(faturasData);
    
    // Filtra faturas do mês especificado com status "A pagar"
    const faturasMes = faturas.filter(fatura => {
      const mesFatura = fatura.mês?.substring(0, 2);
      const statusAPagar = fatura.status?.toLowerCase() === 'a pagar';
      return mesFatura === mesAtual && statusAPagar;
    });
    
    // Cria mapa de faturas por cartão
    const faturasMap = {};
    faturasMes.forEach(fatura => {
      // Remove o prefixo "Fatura " para fazer match com o nome do cartão
      const nomeCartao = fatura.cartão.replace(/^Fatura\s+/i, '').trim();
      const valorStr = fatura.valor || 'R$ 0,00';
      const valorNumerico = parseFloat(
        valorStr
          .replace('R$', '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.')
      ) || 0;
      
      faturasMap[nomeCartao] = (faturasMap[nomeCartao] || 0) + valorNumerico;
    });
    
    // Calcula limite restante para cada cartão
    const cartoes = cartoesData.map(row => {
      const nome = row[0];
      const limiteStr = row[1] || 'R$ 0,00';
      const limite = parseFloat(
        limiteStr
          .replace('R$', '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.')
      ) || 0;
      
      const fatura = faturasMap[nome] || 0;
      const limiteRestante = Math.max(0, limite - fatura); // Se negativo, considera 0
      
      return {
        nome,
        limite,
        fatura,
        limiteRestante,
        limiteFormatado: formatarMoeda(limite),
        faturaFormatada: formatarMoeda(fatura),
        limiteRestanteFormatado: formatarMoeda(limiteRestante)
      };
    });
    
    // Total é a soma dos limites restantes individuais (já com Math.max aplicado)
    const totalLimiteRestante = cartoes.reduce((acc, cartao) => acc + cartao.limiteRestante, 0);

    return res.status(200).json({
      success: true,
      mes: mesAtual,
      totalLimiteRestante,
      totalLimiteRestanteFormatado: formatarMoeda(totalLimiteRestante),
      data: cartoes,
    });

  } catch (error) {
    console.error('Erro na API /limites-cartoes:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar limites de cartões',
      details: error.message
    });
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}
