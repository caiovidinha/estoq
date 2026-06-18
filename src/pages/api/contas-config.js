import { getContasConfig } from '@/lib/sheets';

/**
 * API Route: /api/contas-config
 * Retorna lista de contas de Configurações!D2:D (apenas nomes, sem saldos)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const contas = await getContasConfig();

    // Cache por 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: contas.length,
      data: contas,
    });

  } catch (error) {
    console.error('Erro na API /contas-config:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar contas' 
    });
  }
}
