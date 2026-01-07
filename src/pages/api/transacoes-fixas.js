import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/transacoes-fixas
 * Retorna transações fixas (coluna I = TRUE) de um determinado mês
 * 
 * Query params:
 * - mes: número do mês (ex: "01", "02", etc)
 * - ano: ano (ex: "2026")
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mes, ano } = req.query;

  if (!mes || !ano) {
    return res.status(400).json({ 
      error: 'Parâmetros "mes" e "ano" são obrigatórios' 
    });
  }

  try {
    // Busca dados da planilha: Extrato!A:I
    const rawData = await getRange('Extrato!A:I');
    
    if (!rawData || rawData.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Usa parseSheetData para converter
    const todasTransacoes = parseSheetData(rawData);

    // Filtra por mês/ano e fixa=TRUE
    const transacoesFixas = todasTransacoes
      .filter(trans => {
        if (!trans.data || !trans.fixa) return false;
        
        // Extrai mês e ano da data
        const [dia, mesData, anoData] = trans.data.split('/');
        
        // Verifica se é fixa e se é do mês/ano solicitado
        return (
          trans.fixa.toUpperCase() === 'TRUE' &&
          mesData === mes &&
          anoData === ano
        );
      })
      .map(trans => {
        // Parse do valor (pode vir como "-R$ 730,00" ou "R$ 5.968,90")
        let valorNumerico = 0;
        if (trans.valor && trans.valor !== '') {
          const valorLimpo = trans.valor
            .replace('R$', '')
            .replace(/\s/g, '')  // Remove espaços
            .replace(/\./g, '')   // Remove pontos dos milhares
            .replace(',', '.');   // Troca vírgula por ponto
          
          valorNumerico = parseFloat(valorLimpo);
        }
        
        return {
          ...trans,
          valorNumerico: valorNumerico,
          dia: parseInt(trans.data.split('/')[0])
        };
      });

    // Ordena por dia
    transacoesFixas.sort((a, b) => a.dia - b.dia);

    return res.status(200).json({
      success: true,
      count: transacoesFixas.length,
      data: transacoesFixas,
    });

  } catch (error) {
    console.error('Erro na API /transacoes-fixas:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar transações fixas',
      details: error.message
    });
  }
}
