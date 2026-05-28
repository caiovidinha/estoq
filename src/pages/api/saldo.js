import { getSaldoGeral, getRange } from '@/lib/sheets';

/**
 * API Route: /api/saldo
 * Retorna o saldo geral da célula API!A2
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const [saldo, rawMensal] = await Promise.all([
      getSaldoGeral(),
      getRange('Mensal!A:C'),
    ]);

    // Determina o mês atual no formato "01 - JANEIRO"
    const hoje = new Date();
    const mesAtualNum = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoAtual = String(hoje.getFullYear());

    // Busca o saldo do mês atual no balanço mensal
    let gastoDiario = null;
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const diffMs = ultimoDiaMes - hoje;
    const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclui hoje

    let saldoBase = null;

    if (rawMensal && rawMensal.length > 1) {
      const [, ...rows] = rawMensal;
      const entradaMes = rows.find(row => {
        if (!row[0] || !row[1]) return false;
        const mesNum = row[0].split(' ')[0];
        return mesNum === mesAtualNum && row[1] === anoAtual;
      });
      if (entradaMes && entradaMes[2]) {
        saldoBase = parseFloat(
          entradaMes[2].replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
        );
      }
    }

    // Fallback para o saldo atual caso não encontre o mês no balanço mensal
    if (saldoBase === null || isNaN(saldoBase)) {
      saldoBase = parseFloat(
        saldo.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
      );
    }

    if (diasRestantes > 0 && !isNaN(saldoBase) && saldoBase > 0) {
      const valor = saldoBase / diasRestantes;
      gastoDiario = 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    let gastoSemanal = null;
    if (diasRestantes >= 7 && !isNaN(saldoBase) && saldoBase > 0) {
      const valor = (saldoBase / diasRestantes) * 7;
      gastoSemanal = 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Cache por 30 segundos
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      valor: saldo,
      gastoDiario,
      gastoSemanal,
    });

  } catch (error) {
    console.error('Erro na API /saldo:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar saldo' 
    });
  }
}
