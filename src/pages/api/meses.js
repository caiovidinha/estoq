import { getMeses } from '@/lib/sheets';

/**
 * API Route: /api/meses
 * Retorna lista de meses de Configurações!G2:G
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const meses = await getMeses();

    // Cache por 1 hora (meses são fixos)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: meses.length,
      data: meses,
    });

  } catch (error) {
    console.error('Erro na API /meses:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar meses' 
    });
  }
}
