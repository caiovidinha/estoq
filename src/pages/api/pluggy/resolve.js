/**
 * POST /api/pluggy/resolve
 * Resolve um conflito de importação bancária.
 *
 * Body:
 * {
 *   action: 'merge' | 'insert' | 'dismiss',
 *   existingMatch: { rowIndex, tipo, ... }  // necessário para 'merge'
 *   bankTransaction: { description, amount, date, ... }  // necessário para 'insert'
 * }
 *
 * merge  → marca a entrada pendente como Pago/Recebido (mesma lógica do updateStatus)
 * insert → insere a transação bancária como nova linha no Extrato
 * dismiss → não faz nada no servidor (o cliente remove do estado local)
 */
import { updateCell, createTransacao } from '@/lib/sheets';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDateBR(isoDate) {
  const d = new Date(isoDate);
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return { dataBR: `${day}/${month}/${year}`, mes: MONTH_NAMES[d.getUTCMonth()] };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { action, existingMatch, bankTransaction } = req.body;
  console.log('[Pluggy][resolve] action:', action);
  console.log('[Pluggy][resolve] existingMatch:', existingMatch ? { rowIndex: existingMatch.rowIndex, descritivo: existingMatch.descritivo, valor: existingMatch.valor, data: existingMatch.data, tipo: existingMatch.tipo } : null);
  console.log('[Pluggy][resolve] bankTransaction:', bankTransaction ? { description: bankTransaction.description, amount: bankTransaction.amount, date: bankTransaction.date, type: bankTransaction.type, aiSuggestion: bankTransaction.aiSuggestion } : null);

  if (!action) {
    console.error('[Pluggy][resolve] action ausente no body');
    return res.status(400).json({ error: 'action é obrigatório' });
  }

  try {
    // ── dismiss: nenhuma alteração na planilha ─────────────────────────────
    if (action === 'dismiss') {
      console.log('[Pluggy][resolve] dismiss — nenhuma alteração na planilha');
      return res.status(200).json({ success: true });
    }

    // ── merge: atualiza status + data da entrada pendente existente ────────
    if (action === 'merge') {
      if (!existingMatch?.rowIndex) {
        console.error('[Pluggy][resolve] rowIndex ausente para merge');
        return res.status(400).json({ error: 'existingMatch.rowIndex obrigatório para merge' });
      }

      const tipo = existingMatch.tipo?.toUpperCase();
      const novoStatus = tipo === 'RECEITA' ? 'Recebido' : 'Pago';
      const rowIdx = existingMatch.rowIndex;
      console.log(`[Pluggy][resolve] merge → linha ${rowIdx}, tipo=${tipo}, novoStatus=${novoStatus}`);

      // Coluna G = situação, Coluna D = data (mesma lógica do updateStatus.js)
      console.log(`[Pluggy][resolve] updateCell Extrato!G${rowIdx} →`, novoStatus);
      await updateCell(`Extrato!G${rowIdx}`, novoStatus);

      const hoje = new Date();
      const dataHoje = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
      console.log(`[Pluggy][resolve] updateCell Extrato!D${rowIdx} →`, dataHoje);
      await updateCell(`Extrato!D${rowIdx}`, dataHoje);

      console.log('[Pluggy][resolve] merge concluído com sucesso');
      return res.status(200).json({ success: true });
    }

    // ── insert: cria nova transação com dados do banco ─────────────────────
    if (action === 'insert') {
      if (!bankTransaction) {
        console.error('[Pluggy][resolve] bankTransaction ausente para insert');
        return res.status(400).json({ error: 'bankTransaction obrigatório para insert' });
      }

      const { dataBR, mes } = formatDateBR(bankTransaction.date);
      const valorNum = Math.abs(bankTransaction.amount);
      // Formata como "R$ 1.234,56"
      const valorFormatado = `R$ ${valorNum.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

      // Usa o campo `type` da Pluggy (DEBIT=saída, CREDIT=entrada) — correto para débito e crédito
      const tipo = bankTransaction.type === 'CREDIT' ? 'RECEITA' : 'DESPESA';
      const situacao = tipo === 'RECEITA' ? 'Recebido' : 'Pago';

      // Usa sugestão de categoria da IA se disponível
      const descritivo = bankTransaction.aiSuggestion?.descritivo || tipo;
      const detalhesAI = bankTransaction.aiSuggestion?.detalhes || '';

      // Tenta extrair nome do estabelecimento do paymentData, se disponível
      const detalhesPayment =
        bankTransaction.paymentData?.receiver?.name ||
        bankTransaction.paymentData?.payer?.name ||
        '';
      const detalhes = detalhesAI || detalhesPayment;

      const payload = { tipo, descritivo, valor: valorFormatado, data: dataBR, mes, detalhes, situacao, conta: 'Nubank' };
      console.log('[Pluggy][resolve] insert → createTransacao payload:', payload);
      await createTransacao(payload);
      console.log('[Pluggy][resolve] insert concluído com sucesso');

      return res.status(200).json({ success: true });
    }

    console.error('[Pluggy][resolve] Ação inválida:', action);
    return res.status(400).json({ error: `Ação inválida: ${action}` });
  } catch (error) {
    console.error('[Pluggy][resolve] Erro inesperado:', error.message);
    console.error('[Pluggy][resolve] Stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
}
