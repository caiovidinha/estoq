/**
 * POST /api/pluggy/sync
 * Busca transações recentes do Nubank via Pluggy e cruza com entradas
 * "A pagar" / "A receber" da planilha, retornando potenciais duplicatas.
 *
 * Body: { itemId: string }
 *
 * Resposta:
 * {
 *   conflicts: [
 *     {
 *       bankTransaction: { id, description, amount, date, ... },
 *       existingMatch: { rowIndex, tipo, descritivo, valor, data, ... },
 *       confidence: 'high' | 'medium' | 'low'
 *     }
 *   ],
 *   newTransactions: [ ...transações sem nenhuma correspondência ]
 * }
 */
import { PluggyClient } from 'pluggy-sdk';
import { getRange, parseSheetData } from '@/lib/sheets';

// ── Helpers ────────────────────────────────────────────────────────────────

function getPluggyClient() {
  return new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET,
  });
}

/**
 * Extrai valor numérico absoluto de string "R$ 1.234,56" → 1234.56
 */
function normalizeValue(str) {
  if (!str) return 0;
  return Math.abs(
    parseFloat(
      str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
    ) || 0
  );
}

/**
 * Converte "DD/MM/YYYY" → Date
 */
function parseDateBR(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}

/**
 * Calcula a confiança do match entre uma entrada pendente e uma transação bancária.
 * Critérios:
 *   high   → mesmo dia + valor com diferença < 1%
 *   medium → até 1 dia + diferença < 5%
 *   low    → até 3 dias + diferença < 10%
 */
function matchScore(existing, bankTx) {
  const existingVal = normalizeValue(existing.valor);
  const bankVal = Math.abs(bankTx.amount);

  if (existingVal === 0) return null;

  const existingDate = parseDateBR(existing.data);
  // Pluggy SDK retorna date como objeto Date (não string ISO)
  const bankDate = new Date(bankTx.date);

  if (!existingDate) return null;

  const daysDiff = Math.abs((existingDate - bankDate) / 86_400_000);
  const valueDiff = Math.abs(existingVal - bankVal) / existingVal;

  if (daysDiff === 0 && valueDiff < 0.01) return 'high';
  if (daysDiff <= 1 && valueDiff < 0.05) return 'medium';
  if (daysDiff <= 3 && valueDiff < 0.10) return 'low';
  return null;
}

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { itemId } = req.body;
  console.log('[Pluggy][sync] itemId recebido:', itemId);

  if (!itemId) {
    console.error('[Pluggy][sync] itemId ausente no body');
    return res.status(400).json({ error: 'itemId é obrigatório' });
  }

  try {
    console.log('[Pluggy][sync] Inicializando PluggyClient...');
    const pluggy = getPluggyClient();

    // 1. Busca contas vinculadas ao item
    console.log('[Pluggy][sync] Buscando contas para itemId:', itemId);
    const { results: accounts } = await pluggy.fetchAccounts(itemId);
    console.log('[Pluggy][sync] Contas encontradas:', accounts.map(a => ({ id: a.id, type: a.type, name: a.name })));

    // 2. Busca transações dos últimos 45 dias (cobre mês atual + início do próximo)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 45);
    const from = fromDate.toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    console.log('[Pluggy][sync] Período de busca:', { from, to });

    let bankTransactions = [];
    for (const account of accounts) {
      try {
        console.log(`[Pluggy][sync] Buscando transações da conta ${account.name} (${account.type}, id=${account.id})...`);
        const txData = await pluggy.fetchTransactions(account.id, { from, to, pageSize: 500 });
        const txList = txData.results || [];
        console.log(`[Pluggy][sync] → ${txList.length} transações encontradas na conta ${account.name}`);
        bankTransactions = [
          ...bankTransactions,
          ...txList.map(tx => ({ ...tx, _accountType: account.type })),
        ];
      } catch (txErr) {
        console.warn(`[Pluggy][sync] Conta ${account.name} sem acesso a transações:`, txErr.message);
      }
    }
    // Filtra apenas transações POSTED (PENDING = fatura aberta/parcela futura, ainda não liquidada)
    const totalBruto = bankTransactions.length;
    bankTransactions = bankTransactions.filter(tx => !tx.status || tx.status === 'POSTED');
    console.log(`[Pluggy][sync] Total de transações bancárias: ${totalBruto} brutas, ${bankTransactions.length} POSTED (filtradas PENDING)`);

    // 3. Carrega entradas pendentes da planilha (Extrato – débito)
    console.log('[Pluggy][sync] Carregando entradas pendentes da planilha...');
    const rawExtrato = await getRange('Extrato!A:I');
    const pendentes = parseSheetData(rawExtrato).filter(m => {
      const sit = m['situação'] || m['situacao'] || '';
      return sit === 'A pagar' || sit === 'A receber';
    });
    console.log('[Pluggy][sync] Entradas pendentes encontradas na planilha:', pendentes.length);

    // 4. Algoritmo de matching (greedy: prioriza confiança alta)
    const usedPendingRows = new Set();
    const usedBankIds = new Set();
    const conflicts = [];
    const newTransactions = [];

    console.log('[Pluggy][sync] Iniciando algoritmo de matching...');
    // Primeiro passa: high confidence
    for (const bankTx of bankTransactions) {
      let bestMatch = null;
      let bestScore = null;

      for (const pending of pendentes) {
        if (usedPendingRows.has(pending.rowIndex)) continue;
        const score = matchScore(pending, bankTx);
        if (score === 'high') {
          bestMatch = pending;
          bestScore = score;
          break;
        }
        if ((score === 'medium' || score === 'low') && bestScore !== 'medium') {
          bestMatch = pending;
          bestScore = score;
        }
      }

      if (bestMatch) {
        console.log(`[Pluggy][sync] MATCH [${bestScore}] "${bankTx.description}" (R$ ${bankTx.amount}, ${new Date(bankTx.date).toISOString().slice(0,10)}) ↔ "${bestMatch.descritivo}" (${bestMatch.valor}, ${bestMatch.data}) [linha ${bestMatch.rowIndex}]`);
        usedPendingRows.add(bestMatch.rowIndex);
        usedBankIds.add(bankTx.id);
        conflicts.push({ bankTransaction: bankTx, existingMatch: bestMatch, confidence: bestScore });
      } else {
        console.log(`[Pluggy][sync] SEM MATCH "${bankTx.description}" (R$ ${bankTx.amount}, ${new Date(bankTx.date).toISOString().slice(0,10)}, type=${bankTx.type})`);
        newTransactions.push(bankTx);
      }
    }
    console.log('[Pluggy][sync] Resultado do matching → conflicts:', conflicts.length, '| novas:', newTransactions.length);

    // 5. Categoriza novas transações com IA (se OPENAI_API_KEY estiver configurada)
    let categorizedNew = newTransactions;
    if (process.env.OPENAI_API_KEY && newTransactions.length > 0) {
      console.log('[Pluggy][sync] OPENAI_API_KEY presente — chamando /api/ai/categorize para', newTransactions.length, 'transações...');
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const aiRes = await fetch(`${baseUrl}/api/ai/categorize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: newTransactions.map(tx => ({
              description: tx.description,
              type: tx.type,
              amount: tx.amount,
              date: tx.date,
            })),
          }),
        });

        console.log('[Pluggy][sync] Resposta da IA — status HTTP:', aiRes.status);
        if (aiRes.ok) {
          const { results } = await aiRes.json();
          console.log('[Pluggy][sync] Categorias sugeridas pela IA:', results.map((r, i) => `"${newTransactions[i]?.description}" → ${r?.descritivo} (${r?.tipo})`));
          categorizedNew = newTransactions.map((tx, i) => ({
            ...tx,
            aiSuggestion: results[i] || null,
          }));
        } else {
          console.warn('[Pluggy][sync] IA retornou erro HTTP', aiRes.status, '— continuando sem categorização');
        }
      } catch (aiErr) {
        // IA indisponível não impede o sync
        console.warn('[Pluggy][sync] Categorização por IA falhou, continuando sem ela:', aiErr.message);
      }
    } else if (!process.env.OPENAI_API_KEY) {
      console.log('[Pluggy][sync] OPENAI_API_KEY não configurada — pulando categorização por IA');
    } else {
      console.log('[Pluggy][sync] Nenhuma transação nova para categorizar');
    }

    console.log('[Pluggy][sync] Sync concluído → conflicts:', conflicts.length, '| newTransactions:', categorizedNew.length);
    return res.status(200).json({ conflicts, newTransactions: categorizedNew });
  } catch (error) {
    console.error('[Pluggy][sync] Erro inesperado:', error.message);
    console.error('[Pluggy][sync] Stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
}
