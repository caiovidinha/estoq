import { getCategorias } from '@/lib/sheets';

/**
 * API Route: /api/categorias
 * Retorna lista de categorias de Configurações!A2:A
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const categorias = await getCategorias();

    // Cache por 5 minutos (categorias mudam pouco)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      count: categorias.length,
      data: categorias,
    });

  } catch (error) {
    console.error('Erro na API /categorias:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar categorias' 
    });
  }
}
