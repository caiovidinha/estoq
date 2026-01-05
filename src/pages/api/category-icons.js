import { getCategoryIconMapping } from '@/lib/sheets';

/**
 * API Route: GET /api/category-icons
 * Retorna mapeamento de categorias → ícones da planilha Configurações!A2:F
 */
export default async function handler(req, res) {
  // Cache de 5 minutos (dados de configuração mudam pouco)
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const mapping = await getCategoryIconMapping();
    
    return res.status(200).json({
      success: true,
      data: mapping
    });
  } catch (error) {
    console.error('Erro na API GET /category-icons:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar mapeamento de ícones',
      details: error.message
    });
  }
}
