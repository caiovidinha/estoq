/**
 * GET /api/pluggy/connect-token
 * Retorna um connect token para o widget Pluggy Connect.
 *
 * Variáveis de ambiente necessárias:
 *   PLUGGY_CLIENT_ID
 *   PLUGGY_CLIENT_SECRET
 */
import { PluggyClient } from 'pluggy-sdk';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('[Pluggy][connect-token] PLUGGY_CLIENT_ID presente:', !!process.env.PLUGGY_CLIENT_ID);
  console.log('[Pluggy][connect-token] PLUGGY_CLIENT_SECRET presente:', !!process.env.PLUGGY_CLIENT_SECRET);

  if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_CLIENT_SECRET) {
    console.error('[Pluggy][connect-token] Credenciais ausentes no .env');
    return res.status(500).json({ error: 'Credenciais Pluggy não configuradas (PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET)' });
  }

  try {
    console.log('[Pluggy][connect-token] Inicializando PluggyClient...');
    const pluggy = new PluggyClient({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    });

    console.log('[Pluggy][connect-token] Solicitando connect token...');
    const { accessToken } = await pluggy.createConnectToken();
    console.log('[Pluggy][connect-token] Token gerado (primeiros 20 chars):', accessToken?.slice(0, 20) + '...');

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('[Pluggy][connect-token] Erro ao obter connect token:', error.message);
    console.error('[Pluggy][connect-token] Stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
}
