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
 * GET /api/totais-anuais?ano=2026
 * Returns per-month: receitas, despesas, diarios, economias, cartao,
 *   custoVida, performance, diarioMedio, daysElapsed
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const anoNum = parseInt(req.query.ano);
  if (!anoNum) return res.status(400).json({ success: false, error: 'ano é obrigatório' });

  try {
    const [extratoRaw, diarioRaw] = await Promise.all([
      getRange('Extrato!A:I'),
      getRange('Diário!N1'),
    ]);

    const diarioDefault = parseBRL(diarioRaw?.[0]?.[0]);
    const movs = parseExtrato(extratoRaw);

    const today = new Date();

    const filtered = movs.filter(m => {
      const d = parseDate(m.data);
      return d && d.year === anoNum && isAfterCutoff(m.data);
    });

    const months = Array.from({ length: 12 }, (_, i) => {
      const mesNum = i + 1;
      const isCurrentMonth = today.getFullYear() === anoNum && today.getMonth() + 1 === mesNum;
      const isFutureMonth  = new Date(anoNum, mesNum - 1) > new Date(today.getFullYear(), today.getMonth());
      const todayDay       = isCurrentMonth ? today.getDate() : null;
      const daysInMonth    = new Date(anoNum, mesNum, 0).getDate();

      const inMonth = filtered.filter(m => {
        const d = parseDate(m.data);
        return d && d.month === mesNum;
      });

      const receitas  = inMonth.filter(m => m.tipoAB === 'RECEITA' && isFixa(m.fixa)).reduce((s, m) => s + parseBRL(m.valor), 0);
      const despesas  = inMonth.filter(m => m.tipoAB === 'DESPESA' && isFixa(m.fixa) && m.subtipo.toLowerCase() !== 'cartão' && m.subtipo.toLowerCase() !== 'investimentos').reduce((s, m) => s + parseBRL(m.valor), 0);
      const economias = inMonth.filter(m => m.subtipo.toLowerCase() === 'investimentos').reduce((s, m) => s + parseBRL(m.valor), 0);
      const cartao    = inMonth.filter(m => m.subtipo.toLowerCase() === 'cartão').reduce((s, m) => s + parseBRL(m.valor), 0);

      // Diários: sum actual + forecast for future days
      let diarios = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dayMovs    = inMonth.filter(m => parseDate(m.data)?.day === d);
        const isFuture   = isFutureMonth || (isCurrentMonth && d > todayDay);
        const diariosDay = dayMovs.filter(m => m.tipoAB === 'DESPESA' && !isFixa(m.fixa) && m.subtipo.toLowerCase() !== 'investimentos' && m.subtipo.toLowerCase() !== 'cartão');
        if (isFuture && diariosDay.length === 0) {
          diarios += diarioDefault;
        } else {
          diarios += diariosDay.reduce((s, m) => s + parseBRL(m.valor), 0);
        }
      }

      // diarioReal = only actual transactions (no forecast)
      const diariosReal = inMonth.filter(m => m.tipoAB === 'DESPESA' && !isFixa(m.fixa) && m.subtipo.toLowerCase() !== 'investimentos' && m.subtipo.toLowerCase() !== 'cartão').reduce((s, m) => s + parseBRL(m.valor), 0);

      const custoVida   = despesas + diariosReal + cartao;
      const performance = receitas - despesas - diariosReal - economias - cartao;

      // Days elapsed in this month (for diário médio)
      const CUTOFF_DAY  = (mesNum === 6 && anoNum === 2026) ? 15 : 1;
      const lastDay     = todayDay !== null ? todayDay : (isFutureMonth ? 0 : daysInMonth);
      const daysElapsed = Math.max(0, lastDay - CUTOFF_DAY + 1);
      const diarioMedio = daysElapsed > 0 ? diariosReal / daysElapsed : 0;

      return {
        mes: MESES[i], mesNum, receitas, despesas, economias, cartao,
        diarios: diariosReal, custoVida, performance, diarioMedio, daysElapsed, daysInMonth,
      };
    });

    // Yearly totals
    const totals = months.reduce((acc, m) => ({
      receitas:    acc.receitas    + m.receitas,
      despesas:    acc.despesas    + m.despesas,
      economias:   acc.economias   + m.economias,
      cartao:      acc.cartao      + m.cartao,
      diarios:     acc.diarios     + m.diarios,
      custoVida:   acc.custoVida   + m.custoVida,
      performance: acc.performance + m.performance,
    }), { receitas: 0, despesas: 0, economias: 0, cartao: 0, diarios: 0, custoVida: 0, performance: 0 });

    return res.status(200).json({ success: true, ano: anoNum, months, totals, diarioDefault });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
