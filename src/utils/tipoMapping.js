/**
 * Maps raw asset types (from the "Carteira" sheet's "Tipo" column)
 * to the canonical allocation categories used in the "Alocacao" sheet.
 *
 * Canonical categories:
 *   Ações | Fundos Imobiliários | Ações no Exterior | Renda Fixa | Cripto | ETFs
 *
 * Add more entries here as new types appear in the spreadsheet.
 */
const RAW_TO_CATEGORIA = {
  // ── Ações ─────────────────────────────────────────────────────────────────
  'acao':            'Ações',
  'ação':            'Ações',
  'acoes':           'Ações',
  'ações':           'Ações',
  'acao br':         'Ações',
  'ação br':         'Ações',
  'small cap':       'Ações',

  // ── Fundos Imobiliários ───────────────────────────────────────────────────
  'fii':                    'Fundos Imobiliários',
  'fundo imobiliario':      'Fundos Imobiliários',
  'fundo imobiliário':      'Fundos Imobiliários',
  'fundos imobiliarios':    'Fundos Imobiliários',
  'fundos imobiliários':    'Fundos Imobiliários',
  'fiagro':                 'Fundos Imobiliários',

  // ── Ações no Exterior ─────────────────────────────────────────────────────
  'bdr':             'Ações no Exterior',
  'stock':           'Ações no Exterior',
  'stocks':          'Ações no Exterior',
  'acao exterior':   'Ações no Exterior',
  'ação exterior':   'Ações no Exterior',
  'acoes exterior':  'Ações no Exterior',
  'ações exterior':  'Ações no Exterior',
  'exterior':        'Ações no Exterior',
  'international':   'Ações no Exterior',

  // ── ETFs ──────────────────────────────────────────────────────────────────
  'etf':             'ETFs',
  'etfs':            'ETFs',
  'etf br':          'ETFs',
  'etf exterior':    'ETFs',
  'etf internacional':'ETFs',
  'fof':             'ETFs',   // Fund of Funds

  // ── Renda Fixa ────────────────────────────────────────────────────────────
  'rdb':             'Renda Fixa',
  'rdb imediato':    'Renda Fixa',
  'rdb turbo':       'Renda Fixa',
  'cdb':             'Renda Fixa',
  'lci':             'Renda Fixa',
  'lca':             'Renda Fixa',
  'lc':              'Renda Fixa',
  'cri':             'Renda Fixa',
  'cra':             'Renda Fixa',
  'debenture':       'Renda Fixa',
  'debênture':       'Renda Fixa',
  'debentura':       'Renda Fixa',
  'tesouro':         'Renda Fixa',
  'tesouro direto':  'Renda Fixa',
  'tesouro selic':   'Renda Fixa',
  'tesouro ipca':    'Renda Fixa',
  'tesouro prefixado':'Renda Fixa',
  'renda fixa':      'Renda Fixa',
  'rf':              'Renda Fixa',
  'poupanca':        'Renda Fixa',
  'poupança':        'Renda Fixa',

  // ── Cripto ────────────────────────────────────────────────────────────────
  'cripto':          'Cripto',
  'criptomoeda':     'Cripto',
  'crypto':          'Cripto',
  'cryptocurrency':  'Cripto',
};

/**
 * Returns the canonical allocation category for a given raw tipo string.
 * Falls back to the original value (title-cased) if no mapping found.
 *
 * @param {string} rawTipo - value from the "Tipo" column of the Carteira sheet
 * @returns {string} canonical category name
 */
export function tipoParaCategoria(rawTipo) {
  if (!rawTipo) return 'Outros';
  const key = rawTipo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents for lookup
    .trim();

  // Try with accents stripped
  const keyNoAccent = key;
  // Also try original lowercase (in case the map has accented keys)
  const keyOrig = rawTipo.toLowerCase().trim();

  return (
    RAW_TO_CATEGORIA[keyOrig] ||
    RAW_TO_CATEGORIA[keyNoAccent] ||
    // last resort: title-case the original
    rawTipo.trim()
  );
}

/** All known canonical categories, in display order */
export const CATEGORIAS = [
  'Ações',
  'Fundos Imobiliários',
  'Ações no Exterior',
  'Renda Fixa',
  'Cripto',
  'ETFs',
];
