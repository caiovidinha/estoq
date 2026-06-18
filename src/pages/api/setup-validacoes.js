/**
 * POST /api/setup-validacoes
 *
 * Applies dropdown data validation to the Carteira and Alocacao sheets:
 *   - Carteira  → column B (Tipo), column J (Categoria)
 *   - Alocacao  → column A (Tipo)
 *
 * Idempotent — safe to run multiple times.
 */

import { getClient } from '@/lib/sheets';

// ─── Preferred display values for each dropdown ──────────────────────────────

/** Raw asset types used in the Carteira "Tipo" column */
const TIPOS_CARTEIRA = [
  // Renda Variável BR
  'Ações',
  'FIIs',
  'ETF',
  // Renda Variável Exterior
  'BDR',
  'Stocks',
  'ETF Exterior',
  // Renda Fixa
  'CDB',
  'RDB',
  'LCI',
  'LCA',
  'LC',
  'CRI',
  'CRA',
  'Debênture',
  'Tesouro Direto',
  // Cripto
  'Cripto',
];

/** Canonical allocation categories used in the Alocacao "Tipo" column */
const CATEGORIAS_ALOCACAO = [
  'Ações',
  'Fundos Imobiliários',
  'Ações no Exterior',
  'Renda Fixa',
  'Cripto',
  'ETFs',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dropdownRule(values) {
  return {
    condition: {
      type: 'ONE_OF_LIST',
      values: values.map((v) => ({ userEnteredValue: v })),
    },
    showCustomUi: true, // renders as a native dropdown in the cell
    strict: false,      // warn on invalid value, but don't hard-block
  };
}

function validationRequest(sheetId, startRow, startCol, endCol, values) {
  return {
    setDataValidation: {
      range: {
        sheetId,
        startRowIndex: startRow, // 0-indexed (1 = skip header row)
        endRowIndex: 1000,
        startColumnIndex: startCol,
        endColumnIndex: endCol,
      },
      rule: dropdownRule(values),
    },
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // 1. Fetch spreadsheet metadata to get sheet IDs
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = meta.data.sheets || [];

    const getSheetId = (title) => {
      const sheet = sheetList.find(
        (s) => s.properties.title.trim().toLowerCase() === title.toLowerCase()
      );
      if (!sheet) throw new Error(`Aba "${title}" não encontrada na planilha`);
      return sheet.properties.sheetId;
    };

    const carteiraId = getSheetId('Carteira');
    const alocacaoId = getSheetId('Alocacao');

    // 2. Build validation requests
    // Carteira: B = index 1 (Tipo)
    // Carteira: J = index 9 (Categoria)
    // Alocacao: A = index 0 (Tipo)
    const requests = [
      validationRequest(carteiraId, 1, 1, 2, TIPOS_CARTEIRA),         // Carteira Tipo
      validationRequest(carteiraId, 1, 9, 10, CATEGORIAS_ALOCACAO),   // Carteira Categoria
      validationRequest(alocacaoId, 1, 0, 1, CATEGORIAS_ALOCACAO),    // Alocacao Tipo
    ];

    // 3. Apply via batchUpdate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    return res.status(200).json({
      success: true,
      message: 'Validações aplicadas com sucesso',
      details: {
        carteiraTipo: TIPOS_CARTEIRA,
        carteiraCategoria: CATEGORIAS_ALOCACAO,
        alocacaoTipo: CATEGORIAS_ALOCACAO,
      },
    });
  } catch (err) {
    console.error('Erro ao aplicar validações:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
