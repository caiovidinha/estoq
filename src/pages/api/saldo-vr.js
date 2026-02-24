import { getSaldoVR } from '@/lib/sheets';

/**
 * API Route: /api/saldo-vr
 * Retorna o saldo de Vale Benefícios (VR/VA) da célula API!B2
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const saldo = await getSaldoVR();

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      valor: saldo,
    });
  } catch (error) {
    console.error('Erro na API /saldo-vr:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar saldo VR',
    });
  }
}
