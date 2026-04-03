/**
 * Script de teste das chamadas Pluggy
 * Roda com: node --env-file=.env test-pluggy.mjs [itemId]
 *
 * Se nao passar itemId, testa so autenticacao + connect token.
 * Se passar itemId, testa tambem contas, saldo e transacoes.
 *
 * Exemplo:
 *   node --env-file=.env test-pluggy.mjs
 *   node --env-file=.env test-pluggy.mjs abc123-item-id
 */

import { PluggyClient } from 'pluggy-sdk';

const CLIENT_ID = process.env.PLUGGY_CLIENT_ID;
const CLIENT_SECRET = process.env.PLUGGY_CLIENT_SECRET;
const itemId = process.argv[2] || null;

// ── Utilitário de log ─────────────────────────────────────────────────────
const ok  = (msg) => console.log('\x1b[32m✔\x1b[0m', msg);
const err = (msg) => console.error('\x1b[31m✖\x1b[0m', msg);
const log = (msg, data) => data !== undefined
  ? console.log('\x1b[36m→\x1b[0m', msg, data)
  : console.log('\x1b[36m→\x1b[0m', msg);
const sep = () => console.log('\x1b[90m' + '─'.repeat(60) + '\x1b[0m');

// ── TESTE 1: Credenciais ──────────────────────────────────────────────────
sep();
console.log('\x1b[1m[1/4] Verificando credenciais .env\x1b[0m');
log('PLUGGY_CLIENT_ID:', CLIENT_ID ? CLIENT_ID.slice(0, 8) + '...' : 'NÃO ENCONTRADO');
log('PLUGGY_CLIENT_SECRET:', CLIENT_SECRET ? CLIENT_SECRET.slice(0, 8) + '...' : 'NÃO ENCONTRADO');

if (!CLIENT_ID || !CLIENT_SECRET) {
  err('Credenciais não encontradas no .env. Abortando.');
  process.exit(1);
}
ok('Credenciais carregadas');
sep();

// ── TESTE 2: Autenticação (Connect Token) ─────────────────────────────────
console.log('\x1b[1m[2/4] Testando autenticação — createConnectToken()\x1b[0m');
let pluggy;
try {
  pluggy = new PluggyClient({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET });
  log('PluggyClient criado com sucesso');

  const { accessToken } = await pluggy.createConnectToken();
  ok('Connect Token gerado!');
  log('Token (primeiros 30 chars):', accessToken.slice(0, 30) + '...');
} catch (e) {
  err('Falha ao criar connect token: ' + e.message);
  console.error(e);
  process.exit(1);
}
sep();

// ── TESTE 3: Contas + Saldo (requer itemId) ───────────────────────────────
console.log('\x1b[1m[3/4] Testando fetchAccounts()\x1b[0m');
if (!itemId) {
  console.log('\x1b[33m⚠\x1b[0m  Nenhum itemId passado como argumento. Pulando teste de contas/saldo.');
  console.log('    Para testar: node test-pluggy.mjs SEU_ITEM_ID');
  sep();
  console.log('\x1b[1m[4/4] Testando fetchTransactions()\x1b[0m');
  console.log('\x1b[33m⚠\x1b[0m  Nenhum itemId passado. Pulando.');
  sep();
  ok('Testes sem itemId concluídos! Autenticação funcionando.');
  process.exit(0);
}

log('itemId:', itemId);
let accounts = [];
try {
  const { results } = await pluggy.fetchAccounts(itemId);
  accounts = results;
  ok(`${accounts.length} conta(s) encontrada(s)`);
  for (const a of accounts) {
    log(`  Conta: ${a.name} | tipo: ${a.type} | saldo: ${a.balance} | limite disponível: ${a.creditData?.availableCreditLimit ?? 'n/a'}`);
  }
} catch (e) {
  err('Erro em fetchAccounts: ' + e.message);
  process.exit(1);
}
sep();

// ── TESTE 4: Transações ───────────────────────────────────────────────────
console.log('\x1b[1m[4/4] Testando fetchTransactions()\x1b[0m');
const fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 45);
const from = fromDate.toISOString().slice(0, 10);
const to = new Date().toISOString().slice(0, 10);
log('Período:', from, '→', to);

let totalTx = 0;
let pendingTx = 0;
let postedTx = 0;

for (const account of accounts) {
  log(`Buscando transações de: ${account.name} (${account.type}, id: ${account.id.slice(0, 8)}...)`);
  try {
    const txData = await pluggy.fetchTransactions(account.id, { from, to, pageSize: 500 });
    const txs = txData.results || [];
    const pending = txs.filter(t => t.status === 'PENDING');
    const posted  = txs.filter(t => !t.status || t.status === 'POSTED');

    totalTx  += txs.length;
    pendingTx += pending.length;
    postedTx  += posted.length;

    ok(`  ${txs.length} transações (${posted.length} POSTED, ${pending.length} PENDING)`);

    if (posted.length > 0) {
      log('  Últimas 3 POSTED:');
      for (const t of posted.slice(0, 3)) {
        const dateStr = t.date instanceof Date ? t.date.toISOString().slice(0,10) : String(t.date).slice(0,10);
        console.log(`     ${dateStr} | ${t.type?.padEnd(6)} | R$ ${t.amount?.toFixed(2).padStart(8)} | ${t.description}`);
      }
    }
  } catch (e) {
    err(`  Erro em fetchTransactions (${account.id.slice(0,8)}...): ${e.message}`);
  }
}

sep();
log('TOTAL transações no período:', totalTx);
log('POSTED (serão usadas no sync):', postedTx);
log('PENDING (filtradas, ignoradas):', pendingTx);
sep();
ok('Todos os testes concluídos!');
