import { getRange } from '@/lib/sheets';

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
    .filter(row => row[3])
    .map((row, idx) => ({
      tipoAB:   (row[0] || '').trim().toUpperCase(),
      subtipo:  (row[1] || '').trim(),
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
 * GET /api/saldos-detalhes?tipo=receitas&mes=6&ano=2026
 *
 * Returns the individual transactions for a given type/month/year.
 * tipos: receitas | despesas | diarios | economias | cartao
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { tipo, mes, ano } = req.query;
  const mesNum = parseInt(mes);
  const anoNum = parseInt(ano);

  if (!tipo || !mesNum || !anoNum) {
    return res.status(400).json({ success: false, error: 'tipo, mes e ano são obrigatórios' });
  }

  try {
    const extratoRaw = await getRange('Extrato!A:I');
    const movs = parseExtrato(extratoRaw);

    // Filter by month + year from DATA (D:D), respecting cutoff
    const inMonth = movs.filter(mov => {
      const d = parseDate(mov.data);
      return d && d.month === mesNum && d.year === anoNum && isAfterCutoff(mov.data);
    });

    let filtered;
    switch (tipo) {
      case 'receitas':
        filtered = inMonth.filter(m => m.tipoAB === 'RECEITA' && isFixa(m.fixa));
        break;
      case 'despesas':
        filtered = inMonth.filter(m =>
          m.tipoAB === 'DESPESA'
          && isFixa(m.fixa)
          && m.subtipo.toLowerCase() !== 'cartão'
          && m.subtipo.toLowerCase() !== 'investimentos'
        );
        break;
      case 'diarios':
        filtered = inMonth.filter(m =>
          m.tipoAB === 'DESPESA'
          && !isFixa(m.fixa)
          && m.subtipo.toLowerCase() !== 'investimentos'
          && m.subtipo.toLowerCase() !== 'cartão'
        );
        break;
      case 'economias':
        filtered = inMonth.filter(m => m.subtipo.toLowerCase() === 'investimentos');
        break;
      case 'cartao':
        filtered = inMonth.filter(m => m.subtipo.toLowerCase() === 'cartão');
        break;
      default:
        filtered = inMonth;
    }

    const data = filtered
      .map(m => ({
        tipo:       m.tipoAB,
        descritivo: m.subtipo,
        valor:      parseBRL(m.valor),
        data:       m.data,
        detalhes:   m.detalhes,
        situacao:   m.situacao,
        conta:      m.conta,
        fixa:       isFixa(m.fixa),
      }))
      .sort((a, b) => {
        const [da, ma, ya] = a.data.split('/').map(Number);
        const [db, mb, yb] = b.data.split('/').map(Number);
        return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
      });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro em /api/saldos-detalhes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
