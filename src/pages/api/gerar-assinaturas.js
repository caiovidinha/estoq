import { getRange, parseSheetData, createTransacaoCredito } from '@/lib/sheets';

const MESES_NOMES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

function computeTransacoes(assinaturas, mesAno) {
  let mesAtualIdx, anoAtual;
  if (mesAno && /^\d{4}-\d{2}$/.test(mesAno)) {
    const [anoStr, mesStr] = mesAno.split('-');
    anoAtual = parseInt(anoStr);
    mesAtualIdx = parseInt(mesStr) - 1;
  } else {
    const hoje = new Date();
    mesAtualIdx = hoje.getMonth();
    anoAtual = hoje.getFullYear();
  }

  const mesAnteriorIdx = mesAtualIdx === 0 ? 11 : mesAtualIdx - 1;
  const anoAnterior = mesAtualIdx === 0 ? anoAtual - 1 : anoAtual;
  const mesEscolhidoNum = String(mesAtualIdx + 1).padStart(2, '0');
  const mesEscolhidoNome = `${mesEscolhidoNum} - ${MESES_NOMES[mesAtualIdx]}`;

  return assinaturas
    .filter(ass => ass.assinatura)
    .map(ass => {
      const usarAnterior =
        ass['mês']?.toLowerCase().includes('anterior') ||
        ass['mes']?.toLowerCase().includes('anterior');

      const dataIdx = usarAnterior ? mesAnteriorIdx : mesAtualIdx;
      const dataAno = usarAnterior ? anoAnterior : anoAtual;
      const dataMesNum = String(dataIdx + 1).padStart(2, '0');
      const dia = String(ass.dia || '1').padStart(2, '0');

      return {
        tipo: 'DESPESA',
        descritivo: 'Assinaturas',
        valor: (() => {
          // Garante que o valor seja negativo (despesa)
          const v = (ass.valor || '').trim();
          return v.startsWith('-') ? v : `-${v}`;
        })(),
        data: `${dia}/${dataMesNum}/${dataAno}`,
        mes: mesEscolhidoNome,
        detalhes: ass.assinatura,
        situacao: 'A pagar',
        cartao: ass['cartão'] || ass['cartao'] || '',
        fixa: true,
      };
    });
}

/**
 * GET  /api/gerar-assinaturas?mesAno=2026-03
 *   → retorna lista de transações pré-calculadas (sem gravar)
 *
 * POST /api/gerar-assinaturas
 *   body: { mesAno, transacao } → grava uma única transação
 */
export default async function handler(req, res) {
  // --- GET: preview da lista ---
  if (req.method === 'GET') {
    const { mesAno } = req.query;
    try {
      const rawData = await getRange('Assinaturas!A:E');
      if (!rawData || rawData.length < 2) {
        return res.status(200).json({ success: true, data: [] });
      }
      const assinaturas = parseSheetData(rawData);
      const transacoes = computeTransacoes(assinaturas, mesAno);
      return res.status(200).json({ success: true, data: transacoes });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // --- POST: grava uma transação ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { transacao } = req.body || {};
  if (!transacao) {
    return res.status(400).json({ success: false, error: 'Campo "transacao" obrigatório' });
  }

  try {
    await createTransacaoCredito(transacao);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
