import { getSaldoVR, getRange, parseSheetData, parseDate } from '@/lib/sheets';

/**
 * API Route: /api/saldo-vr
 * Retorna o saldo de Vale Benefícios (VR/VA) da célula API!B2
 * Também retorna gastoDiario até o próximo recebimento e a data dele
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const [saldo, vrData] = await Promise.all([
      getSaldoVR(),
      getRange('Extrato VR!A:G'),
    ]);

    // Calcula gasto diário até próximo recebimento
    let gastoDiario = null;
    let proximoRecebimento = null;

    const transacoes = parseSheetData(vrData);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximaReceita = transacoes
      .filter(t => t.tipo?.toUpperCase() === 'RECEITA' && t.situação?.toLowerCase() === 'a receber' && t.data)
      .map(t => ({ ...t, dateObj: parseDate(t.data) }))
      .filter(t => t.dateObj && t.dateObj >= hoje)
      .sort((a, b) => a.dateObj - b.dateObj)[0];

    if (proximaReceita) {
      const diffMs = proximaReceita.dateObj - hoje;
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Converte saldo para número
      const saldoNum = parseFloat(
        saldo.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
      );

      if (diffDias > 0 && !isNaN(saldoNum)) {
        const valor = saldoNum / diffDias;
        gastoDiario = 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      proximoRecebimento = proximaReceita.data;
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

    return res.status(200).json({
      success: true,
      valor: saldo,
      gastoDiario,
      proximoRecebimento,
    });
  } catch (error) {
    console.error('Erro na API /saldo-vr:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar saldo VR',
    });
  }
}
