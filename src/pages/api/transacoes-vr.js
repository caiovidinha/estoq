import { createTransacaoVR } from '@/lib/sheets';

/**
 * API Route: POST /api/transacoes-vr
 * Cria uma nova transação em 'Extrato VR'!A:G
 *
 * Body esperado:
 * {
 *   tipo: "RECEITA" | "DESPESA",
 *   descritivo: string,
 *   valor: string,       // ex: "R$ 50,00"
 *   data: string,        // DD/MM/YYYY
 *   mes: string,
 *   detalhes: string,    // opcional
 *   situacao: string,    // "Recebido" | "Pago" | "A receber" | "A pagar"
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const transacao = req.body;

    if (!transacao.tipo || !transacao.descritivo || !transacao.valor || !transacao.data || !transacao.mes) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: tipo, descritivo, valor, data, mes',
      });
    }

    const result = await createTransacaoVR(transacao);

    return res.status(201).json({
      success: true,
      message: 'Transação VR criada com sucesso',
      data: result,
    });
  } catch (error) {
    console.error('Erro na API POST /transacoes-vr:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar transação VR',
      details: error.message,
    });
  }
}
