/**
 * GET /api/pluggy/saldo?itemId=ITEM_ID
 * Retorna saldo real da conta corrente e limite disponível do cartão via Pluggy.
 */
import { PluggyClient } from 'pluggy-sdk';

function formatBRL(value) {
  if (value == null) return null;
  return `R$ ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { itemId } = req.query;
  console.log('[Pluggy][saldo] itemId recebido:', itemId);

  if (!itemId) {
    console.error('[Pluggy][saldo] itemId ausente na query');
    return res.status(400).json({ error: 'itemId é obrigatório' });
  }

  try {
    console.log('[Pluggy][saldo] Inicializando PluggyClient...');
    const pluggy = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    });

    console.log('[Pluggy][saldo] Buscando contas do item:', itemId);
    const { results: accounts } = await pluggy.fetchAccounts(itemId);
    console.log('[Pluggy][saldo] Contas encontradas:', accounts.map(a => ({
      id: a.id,
      type: a.type,
      name: a.name,
      balance: a.balance,
      availableCreditLimit: a.creditData?.availableCreditLimit,
    })));

    // Agrega saldo de todas as contas correntes/poupança
    let saldoContaNum = 0;
    let temConta = false;
    // Agrega limite disponível de todos os cartões
    let limiteDisponivelNum = 0;
    let temCartao = false;

    for (const account of accounts) {
      if (account.type === 'BANK') {
        console.log(`[Pluggy][saldo] Conta BANK: ${account.name} → saldo ${account.balance}`);
        saldoContaNum += account.balance ?? 0;
        temConta = true;
      } else if (account.type === 'CREDIT') {
        console.log(`[Pluggy][saldo] Conta CREDIT: ${account.name} → limite disponível ${account.creditData?.availableCreditLimit}`);
        limiteDisponivelNum += account.creditData?.availableCreditLimit ?? 0;
        temCartao = true;
      } else {
        console.log(`[Pluggy][saldo] Conta tipo ignorado: ${account.type} (${account.name})`);
      }
    }

    console.log('[Pluggy][saldo] Resultado:', { saldoContaNum, limiteDisponivelNum, temConta, temCartao });

    return res.status(200).json({
      success: true,
      saldoConta: temConta ? formatBRL(saldoContaNum) : null,
      limiteDisponivel: temCartao ? formatBRL(limiteDisponivelNum) : null,
    });
  } catch (error) {
    console.error('[Pluggy][saldo] Erro:', error.message);
    console.error('[Pluggy][saldo] Stack:', error.stack);
    return res.status(500).json({ success: false, error: error.message });
  }
}
