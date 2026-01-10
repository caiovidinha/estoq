import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/categorias-agregadas
 * Retorna soma de valores por categoria agregando Extrato e Extrato Crédito
 * 
 * Query params:
 * - mes: número do mês (ex: "01", "02", etc)
 * - ano: ano (ex: "2026")
 * - tipo: "RECEITA" ou "DESPESA"
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mes, ano, tipo } = req.query;

  if (!mes || !ano || !tipo) {
    return res.status(400).json({ 
      error: 'Parâmetros "mes", "ano" e "tipo" são obrigatórios' 
    });
  }

  try {
    // Busca dados das duas planilhas
    const [extratoData, creditoData] = await Promise.all([
      getRange('Extrato!A:H'),
      getRange('Extrato Crédito!A:H')
    ]);

    // Converte para objetos
    const extratoTransacoes = parseSheetData(extratoData);
    const creditoTransacoes = parseSheetData(creditoData);

    // Combina todas as transações
    const todasTransacoes = [...extratoTransacoes, ...creditoTransacoes];

    // Filtra por mês/ano/tipo e exclui categoria "Cartão"
    const transacoesFiltradas = todasTransacoes.filter(trans => {
      if (!trans.data || !trans.tipo || !trans.descritivo) return false;
      
      // Extrai mês e ano da data
      const [dia, mesData, anoData] = trans.data.split('/');
      
      // Filtra
      const mesMatch = mesData === mes;
      const anoMatch = anoData === ano;
      const tipoMatch = trans.tipo.toUpperCase() === tipo.toUpperCase();
      const naoECartao = trans.descritivo.toUpperCase() !== 'CARTÃO';
      
      return mesMatch && anoMatch && tipoMatch && naoECartao;
    });

    // Agrupa por categoria (descritivo) e soma valores
    const categoriasMap = {};
    
    transacoesFiltradas.forEach(trans => {
      const categoria = trans.descritivo;
      
      if (!categoriasMap[categoria]) {
        categoriasMap[categoria] = {
          nome: categoria,
          tipo: trans.tipo,
          transacoes: [],
          total: 0
        };
      }
      
      // Parse do valor
      let valorNumerico = 0;
      if (trans.valor && trans.valor !== '') {
        const valorLimpo = trans.valor
          .replace('R$', '')
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        
        valorNumerico = Math.abs(parseFloat(valorLimpo)); // Valor absoluto para somar
      }
      
      categoriasMap[categoria].total += valorNumerico;
      categoriasMap[categoria].transacoes.push({
        data: trans.data,
        detalhes: trans.detalhes || '',
        valor: trans.valor,
        valorNumerico: valorNumerico,
        conta: trans.conta || trans["cartão"] || 'Sem conta' // Usa conta, se não tiver usa cartão, se não tiver usa "Sem conta"
      });
    });

    // Converte para array e ordena por total (maior primeiro)
    const categorias = Object.values(categoriasMap)
      .sort((a, b) => b.total - a.total);

    // Calcula total geral
    const totalGeral = categorias.reduce((acc, cat) => acc + cat.total, 0);

    return res.status(200).json({
      success: true,
      count: categorias.length,
      totalGeral: totalGeral,
      data: categorias,
    });

  } catch (error) {
    console.error('Erro na API /categorias-agregadas:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar categorias',
      details: error.message
    });
  }
}
