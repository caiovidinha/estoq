import { createTransacaoCredito } from '@/lib/sheets';

/**
 * API Route: POST /api/transacoes-credito
 * Cria uma nova transação de crédito em 'Extrato Crédito'!A:H
 * 
 * Body esperado:
 * {
 *   tipo: "RECEITA" | "DESPESA",
 *   descritivo: string,
 *   valor: "R$ 150,00",
 *   data: "DD/MM/YYYY",
 *   mes: string,
 *   detalhes: string (opcional),
 *   situacao: "Paga" | "Recebida" | "A pagar" | "A receber",
 *   cartao: string
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const transacao = req.body;

    // Validações básicas
    if (!transacao.tipo || !transacao.descritivo || !transacao.valor || !transacao.data || !transacao.mes || !transacao.cartao) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: tipo, descritivo, valor, data, mes, cartao'
      });
    }

    // Cria a transação de crédito na planilha
    const result = await createTransacaoCredito(transacao);

    return res.status(201).json({
      success: true,
      message: 'Transação de crédito criada com sucesso',
      data: result,
    });

  } catch (error) {
    console.error('Erro na API POST /transacoes-credito:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao criar transação de crédito',
      details: error.message
    });
  }
}
