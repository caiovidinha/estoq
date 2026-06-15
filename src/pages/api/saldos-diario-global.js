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

const CUTOFF = new Date(2026, 5, 15);

function isAfterCutoff(dataStr) {
  const d = parseDate(dataStr);
  if (!d) return false;
  return new Date(d.year, d.month - 1, d.day) >= CUTOFF;
}

function parseExtrato(rawData) {
  if (!rawData || rawData.length < 2) return [];
  const [, ...rows] = rawData;
  return rows
    .filter(row => row[3])
    .map((row) => ({
      tipoAB:   (row[0] || '').trim().toUpperCase(),
      subtipo:  (row[1] || '').trim(),
      valor:    row[2] || '0',
      data:     row[3] || '',
      detalhes: row[5] || '',
      fixa:     row[8] || '',
    }));
}

/**
 * GET /api/saldos-diario-global
 * Returns all non-fixed daily transactions since CUTOFF grouped by label (all-time)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const extratoRaw = await getRange('Extrato!A:I');
    const movs = parseExtrato(extratoRaw);

    const diarios = movs.filter(m =>
      isAfterCutoff(m.data)
      && m.tipoAB === 'DESPESA'
      && !isFixa(m.fixa)
      && m.subtipo.toLowerCase() !== 'investimentos'
      && m.subtipo.toLowerCase() !== 'cartão'
    );

    const map = {};
    diarios.forEach(m => {
      const label = m.detalhes || m.subtipo || 'Outros';
      if (!map[label]) map[label] = 0;
      map[label] += parseBRL(m.valor);
    });

    const data = Object.entries(map)
      .map(([label, valor]) => ({ label, valor }))
      .sort((a, b) => b.valor - a.valor);

    // Also return days elapsed since cutoff for divisor
    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(1, Math.floor((today - CUTOFF) / msPerDay) + 1);

    return res.status(200).json({ success: true, data, daysElapsed });
  } catch (error) {
    console.error('Erro em /api/saldos-diario-global:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
