import { getCartoesConfig } from '@/lib/sheets';

/**
 * API Route: /api/cartoes
 * Retorna lista de cartões de crédito de Configurações!E2:E
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const cartoes = await getCartoesConfig();

    // Cache por 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: cartoes.length,
      data: cartoes,
    });

  } catch (error) {
    console.error('Erro na API /cartoes:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar cartões' 
    });
  }
}
