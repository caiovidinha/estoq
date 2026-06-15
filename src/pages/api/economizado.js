import { getRange } from '@/lib/sheets';

function parseBRL(str) {
  if (!str) return 0;
  const s = str.toString()
    .replace(/R\$\s?/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.abs(n);
}

function isFixa(val) {
  return val?.toString().toUpperCase() === 'TRUE';
}

function parseDate(dataStr) {
  if (!dataStr) return null;
  const parts = dataStr.split('/');
  if (parts.length < 3) return null;
  return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
}

const CUTOFF = new Date(2026, 5, 15);
function isAfterCutoff(dataStr) {
  const d = parseDate(dataStr);
  if (!d) return false;
  return new Date(d.year, d.month - 1, d.day) >= CUTOFF;
}

function parseExtrato(rawData) {
  if (!rawData || rawData.length < 2) return [];
  const [, ...rows] = rawData;
  return rows.filter(row => row[3]).map(row => ({
    tipoAB:  (row[0] || '').trim().toUpperCase(),
    subtipo: (row[1] || '').trim(),
    valor:   row[2] || '0',
    data:    row[3] || '',
    fixa:    row[8] || '',
  }));
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

/**
 * GET /api/economizado?ano=2026
 * Returns yearly and per-month economizado data (economias / receitas)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const anoNum = parseInt(req.query.ano);
  if (!anoNum) return res.status(400).json({ success: false, error: 'ano é obrigatório' });

  try {
    const extratoRaw = await getRange('Extrato!A:I');
    const movs = parseExtrato(extratoRaw);

    const filtered = movs.filter(m => {
      const d = parseDate(m.data);
      return d && d.year === anoNum && isAfterCutoff(m.data);
    });

    let totalEconomias = 0, totalReceitas = 0;
    const months = Array.from({ length: 12 }, (_, i) => {
      const mesNum = i + 1;
      const inMonth = filtered.filter(m => {
        const d = parseDate(m.data);
        return d && d.month === mesNum;
      });

      const economias = inMonth
        .filter(m => m.subtipo.toLowerCase() === 'investimentos')
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      const receitas = inMonth
        .filter(m => m.tipoAB === 'RECEITA' && isFixa(m.fixa))
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      const pct = receitas > 0 ? Math.round((economias / receitas) * 100) : 0;
      totalEconomias += economias;
      totalReceitas  += receitas;

      return { mes: MESES[i], mesNum, economias, receitas, pct };
    });

    const totalPct = totalReceitas > 0 ? Math.round((totalEconomias / totalReceitas) * 100) : 0;

    return res.status(200).json({
      success: true,
      ano: anoNum,
      total: { economias: totalEconomias, receitas: totalReceitas, pct: totalPct },
      months,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
