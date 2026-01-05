import { getSaldoGeral } from '@/lib/sheets';

/**
 * API Route: /api/saldo
 * Retorna o saldo geral da célula API!A2
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const saldo = await getSaldoGeral();

    // Cache por 30 segundos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      valor: saldo,
    });

  } catch (error) {
    console.error('Erro na API /saldo:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar saldo' 
    });
  }
}
