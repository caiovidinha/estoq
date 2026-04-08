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

    // Calcula gasto diário até o fim do mês atual
    let gastoDiario = null;
    const hoje = new Date();
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const diffMs = ultimoDiaMes - hoje;
    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclui hoje

    const saldoNum = parseFloat(
      saldo.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
    );

    if (diasRestantes > 0 && !isNaN(saldoNum) && saldoNum > 0) {
      const valor = saldoNum / diasRestantes;
      gastoDiario = 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Cache por 30 segundos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      valor: saldo,
      gastoDiario,
    });

  } catch (error) {
    console.error('Erro na API /saldo:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar saldo' 
    });
  }
}
