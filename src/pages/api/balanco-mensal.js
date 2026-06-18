import { getRange } from '@/lib/sheets';

/**
 * API Route: GET /api/balanco-mensal
 * Retorna o balanço mensal da planilha Mensal!A:C
 * 
 * Formato: Mês | Ano | Saldo
 * Exemplo: "01 - JANEIRO" | "2026" | "R$ 4.926,90"
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Busca dados da planilha: Mensal!A:D
    const rawData = await getRange('Mensal!A:D');
    
    if (!rawData || rawData.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Remove header (primeira linha)
    const [headers, ...rows] = rawData;

    // Converte para array de objetos
    const balanco = rows
      .filter(row => row[0] && row[1] && row[2]) // Filtra linhas vazias
      .map(row => {
        // Extrai o número do mês (ex: "01 - JANEIRO" -> "01")
        const mesNumero = row[0].split(' ')[0];
        
        // Extrai o nome do mês (ex: "01 - JANEIRO" -> "JANEIRO")
        const mesNome = row[0].split(' - ')[1] || row[0];

        const parseValue = (val) => val
          ? parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
          : null;

        return {
          mes: mesNumero,
          mesCompleto: row[0],
          mesNome: mesNome,
          ano: row[1],
          saldo: row[2],
          saldoNumerico: parseValue(row[2]),
          saldoLivre: row[3] || null,
          saldoLivreNumerico: parseValue(row[3])
        };
      });

    // Ordena por ano e mês (mais antigo primeiro)
    balanco.sort((a, b) => {
      if (a.ano !== b.ano) {
        return parseInt(a.ano) - parseInt(b.ano);
      }
      return parseInt(a.mes) - parseInt(b.mes);
    });

    return res.status(200).json({
      success: true,
      count: balanco.length,
      data: balanco,
    });

  } catch (error) {
    console.error('Erro na API /balanco-mensal:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar balanço mensal',
      details: error.message
    });
  }
}
