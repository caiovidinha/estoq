import { getRange } from '@/lib/sheets';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseBRL(str) {
  if (str === null || str === undefined || str === '') return 0;
  const s = str.toString()
    .replace(/R\$\s?/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.abs(n);
}

function isFixa(val) {
  if (!val) return false;
  return val.toString().toUpperCase() === 'TRUE';
}

function parseDate(dataStr) {
  if (!dataStr) return null;
  const parts = dataStr.split('/');
  if (parts.length < 3) return null;
  return { day: parseInt(parts[0]), month: parseInt(parts[1]), year: parseInt(parts[2]) };
}

// Transactions before this date are ignored
const CUTOFF = new Date(2026, 5, 15); // 15/06/2026

function isAfterCutoff(dataStr) {
  const d = parseDate(dataStr);
  if (!d) return false;
  return new Date(d.year, d.month - 1, d.day) >= CUTOFF;
}

// Parse raw Extrato rows by column index (avoids double TIPO header conflict)
// A=tipoAB, B=subtipo, C=valor, D=data, E=mês(ignored), F=detalhes, G=situação, H=conta, I=fixa
function parseExtrato(rawData) {
  if (!rawData || rawData.length < 2) return [];
  const [, ...rows] = rawData;
  return rows
    .filter(row => row[3]) // must have DATA
    .map((row, idx) => ({
      tipoAB:   (row[0] || '').trim().toUpperCase(), // A: RECEITA | DESPESA
      subtipo:  (row[1] || '').trim(),               // B: Cartão | Investimentos | etc.
      valor:    row[2] || '0',
      data:     row[3] || '',
      detalhes: row[5] || '',
      situacao: row[6] || '',
      conta:    row[7] || '',
      fixa:     row[8] || '',
      rowIndex: idx + 2,
    }));
}

/**
 * GET /api/saldos-mensal?mes=6&ano=2026
 *
 * Returns per-day aggregated data for the given month/year.
 * Data source: Extrato!A:I
 * Columns (after parseSheetData): tipo, descritivo, valor, data, mês, detalhes, situação, conta, fixa
 *
 * Rules:
 *  - receitas:  tipo=RECEITA, fixa=TRUE
 *  - despesas:  tipo=DESPESA, fixa=TRUE, descritivo≠Cartão, descritivo≠Investimentos
 *  - diarios:   fixa=FALSE — if future day with no transactions → use Diário!N1 default
 *  - economias: descritivo=Investimentos
 *  - cartao:    descritivo=Cartão
 *  - saldo col: today=API!A2; future=today + cumulative daily balance
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const mesNum = parseInt(req.query.mes);
  const anoNum = parseInt(req.query.ano);

  if (!mesNum || !anoNum) {
    return res.status(400).json({ success: false, error: 'mes e ano são obrigatórios' });
  }

  try {
    const [extratoRaw, saldoRaw, diarioRaw] = await Promise.all([
      getRange('Extrato!A:I'),
      getRange('API!A2'),
      getRange('Diário!N1'),
    ]);

    const saldoAtual = parseBRL(saldoRaw?.[0]?.[0]);
    const diarioDefault = parseBRL(diarioRaw?.[0]?.[0]);

    const movs = parseExtrato(extratoRaw);

    // Filter by month + year from DATA field, respecting cutoff
    const filtered = movs.filter(mov => {
      const d = parseDate(mov.data);
      return d && d.month === mesNum && d.year === anoNum && isAfterCutoff(mov.data);
    });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === anoNum && today.getMonth() + 1 === mesNum;
    const todayDay = isCurrentMonth ? today.getDate() : null;
    const daysInMonth = new Date(anoNum, mesNum, 0).getDate();

    // Build per-day rows
    const days = [];
    let totalReceitas = 0, totalDespesas = 0, totalDiarios = 0, totalEconomias = 0, totalCartao = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const dayMovs = filtered.filter(mov => {
        const p = parseDate(mov.data);
        return p && p.day === d;
      });

      const isFuture = todayDay !== null && d > todayDay;

      const receitas = dayMovs
        .filter(m => m.tipoAB === 'RECEITA' && isFixa(m.fixa))
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      const despesas = dayMovs
        .filter(m => m.tipoAB === 'DESPESA'
          && isFixa(m.fixa)
          && m.subtipo.toLowerCase() !== 'cartão'
          && m.subtipo.toLowerCase() !== 'investimentos')
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      const economias = dayMovs
        .filter(m => m.subtipo.toLowerCase() === 'investimentos')
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      const cartao = dayMovs
        .filter(m => m.subtipo.toLowerCase() === 'cartão')
        .reduce((s, m) => s + parseBRL(m.valor), 0);

      // Diários: non-fixed transactions (excluding investimentos + cartão which are already counted)
      const diariosMovs = dayMovs.filter(m =>
        !isFixa(m.fixa)
        && m.subtipo.toLowerCase() !== 'investimentos'
        && m.subtipo.toLowerCase() !== 'cartão'
      );
      let diarios;
      if (isFuture && diariosMovs.length === 0) {
        diarios = diarioDefault;
      } else {
        diarios = diariosMovs.reduce((s, m) => s + parseBRL(m.valor), 0);
      }

      days.push({ day: d, receitas, despesas, diarios, economias, cartao });

      totalReceitas += receitas;
      totalDespesas += despesas;
      totalDiarios += diarios;
      totalEconomias += economias;
      totalCartao += cartao;
    }

    // ─── Totais calculados ────────────────────────────────────────────────────
    const performance = totalReceitas - totalDespesas - totalDiarios - totalEconomias - totalCartao;
    const economizadoPct = totalReceitas > 0 ? Math.round((totalEconomias / totalReceitas) * 100) : 0;
    const custoVida = totalDespesas + totalDiarios + totalCartao;
    const daysElapsed = todayDay !== null ? Math.min(todayDay, daysInMonth) : daysInMonth;
    const diarioMedio = daysElapsed > 0 ? totalDiarios / daysElapsed : 0;

    // ─── Diário breakdown (non-fixed grouped by detalhes) ────────────────────
    const diariosAll = filtered.filter(m =>
      !isFixa(m.fixa)
      && m.subtipo.toLowerCase() !== 'investimentos'
      && m.subtipo.toLowerCase() !== 'cartão'
    );
    const diarioMap = {};
    diariosAll.forEach(m => {
      const label = m.detalhes || m.subtipo || 'Outros';
      if (!diarioMap[label]) diarioMap[label] = 0;
      diarioMap[label] += parseBRL(m.valor);
    });
    const diarioItems = Object.entries(diarioMap)
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor);

    return res.status(200).json({
      success: true,
      data: days,
      totais: {
        receitas: totalReceitas,
        despesas: totalDespesas,
        diarios: totalDiarios,
        economias: totalEconomias,
        cartao: totalCartao,
        performance,
        economizadoPct,
        custoVida,
        diarioMedio,
        diarioAlvo: diarioDefault,
        daysElapsed,
      },
      diarioItems,
      meta: { saldoAtual, diarioDefault, todayDay, daysInMonth, mesNum, anoNum },
    });
  } catch (error) {
    console.error('Erro em /api/saldos-mensal:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
