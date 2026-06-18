/* eslint-disable no-undef */
import { getRange, updateCell } from '@/lib/sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

async function getClient() {
  const { getClient: gc } = await import('@/lib/sheets');
  // sheets.js exposes getClient — re-use it via getRange side-effect
  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function parseBRLValue(str) {
  if (!str) return null;
  const s = str.toString().replace(/R\$\s?/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

/**
 * GET  /api/diario-config          → { items: [{categoria, valor, medio}], available: string[] }
 * POST /api/diario-config          → add new categoria to the forecast
 *   body: { categoria, valor }
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [fhRaw, jkRaw] = await Promise.all([
        getRange('Diário!F:H'),
        getRange('Diário!J:K'),
      ]);

      // F:H — row[0]=categoria, row[1]=valor meta, row[2]=formula result (médio real)
      // Skip rows that are headers or have no numeric valor (column G)
      const items = (fhRaw || [])
        .map((row, idx) => ({ row, sheetRow: idx + 1 })) // 1-based sheet row
        .filter(({ row }) => {
          if (!row[0] || !row[0].toString().trim()) return false;
          const v = parseBRLValue(row[1]);
          return v !== null && !isNaN(v);
        })
        .map(({ row, sheetRow }) => ({
          categoria: row[0].toString().trim(),
          valor:     parseBRLValue(row[1]),
          medio:     parseBRLValue(row[2]),
          rowNum:    sheetRow,
        }));

      // J:K — all categories (J) and checked flag (K)
      const allCategories = (jkRaw || []).slice(1)
        .filter(row => row[0] && row[0].toString().trim())
        .map(row => ({
          categoria: row[0].toString().trim(),
          checked:   (row[1] || '').toString().toUpperCase() === 'TRUE' || row[1] === true,
        }));

      // Available = not yet in the forecast
      const inForecast = new Set(items.map(i => i.categoria.toLowerCase()));
      const available  = allCategories
        .filter(c => !c.checked && !inForecast.has(c.categoria.toLowerCase()))
        .map(c => c.categoria);

      return res.status(200).json({ success: true, items, available, allCategories });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { categoria, valor } = req.body || {};
    if (!categoria || valor == null) {
      return res.status(400).json({ success: false, error: 'categoria e valor são obrigatórios' });
    }

    try {
      const sheets = await getClient();

      // 1. Get current F:H to find next empty row
      const fhRaw = await getRange('Diário!F:H');
      // +1 for header row, +1 for next empty row
      const nextRow = (fhRaw || []).slice(1).filter(r => r[0]?.toString().trim()).length + 2;
      const rowNum  = nextRow; // 1-based; assume no header row (F1 is already data)

      // 2. Append: F=categoria, G=valor, H=formula
      const formula = `=-SEERRO((SOMASES(Extrato!C:C;Extrato!B:B;F${rowNum};Extrato!G:G;"Pago")+SOMASES('Extrato Crédito'!C:C;'Extrato Crédito'!B:B;F${rowNum};'Extrato Crédito'!G:G;"Pago"))/CONT.VALORES(unique({FILTER(Extrato!E:E;Extrato!B:B=F${rowNum};Extrato!G:G="Pago");FILTER('Extrato Crédito'!E:E;'Extrato Crédito'!B:B=F${rowNum};'Extrato Crédito'!G:G="Pago")}));0)`;

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Diário!F${rowNum}:H${rowNum}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[categoria, valor, formula]] },
      });

      // 3. Find the categoria row in J:K and mark K as TRUE
      const jkRaw = await getRange('Diário!J:K');
      const jkRows = jkRaw || [];
      const catIdx = jkRows.findIndex(
        (row, i) => i > 0 && row[0] && row[0].toString().trim().toLowerCase() === categoria.toLowerCase()
      );
      if (catIdx !== -1) {
        const jkRowNum = catIdx + 1; // 1-based
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Diário!K${jkRowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['TRUE']] },
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro em POST /api/diario-config:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT: update valor for a categoria
  if (req.method === 'PUT') {
    const { rowNum, valor } = req.body || {};
    if (!rowNum || valor == null) {
      return res.status(400).json({ success: false, error: 'rowNum e valor são obrigatórios' });
    }
    try {
      const sheets = await getClient();
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Diário!G${rowNum}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[valor]] },
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE: clear the row and uncheck K column
  if (req.method === 'DELETE') {
    const { rowNum, categoria } = req.body || {};
    if (!rowNum) {
      return res.status(400).json({ success: false, error: 'rowNum é obrigatório' });
    }
    try {
      const sheets = await getClient();
      // Clear F:H row
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `Diário!F${rowNum}:H${rowNum}`,
      });
      // Uncheck K for this categoria in J:K
      if (categoria) {
        const jkRaw = await getRange('Diário!J:K');
        const catIdx = (jkRaw || []).findIndex(
          (row, i) => i > 0 && row[0] && row[0].toString().trim().toLowerCase() === categoria.toLowerCase()
        );
        if (catIdx !== -1) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Diário!K${catIdx + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['FALSE']] },
          });
        }
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
