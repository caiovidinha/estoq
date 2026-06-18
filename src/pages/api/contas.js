import { getContasSaldos } from '@/lib/sheets';

/**
 * API Route: /api/contas
 * Retorna as contas e saldos de API!O:P
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const contas = await getContasSaldos();

    // Cache por 30 segundos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: contas.length,
      data: contas,
    });

  } catch (error) {
    console.error('Erro na API /contas:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar contas' 
    });
  }
}
