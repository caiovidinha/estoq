import { updateCell } from '@/lib/sheets';

/**
 * API Route: PUT /api/updateStatus
 * Atualiza o status de uma movimentação
 * 
 * Body:
 * - rowIndex: número da linha na planilha (ex: 5 para linha 5)
 * - novoStatus: "Pago", "Recebido", "A pagar", "A receber"
 * - sheetName: "Extrato" ou "Extrato Crédito" (opcional, padrão: "Extrato")
 */
export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { rowIndex, novoStatus, sheetName = 'Extrato' } = req.body;

  if (!rowIndex || !novoStatus) {
    return res.status(400).json({ 
      error: 'rowIndex e novoStatus são obrigatórios' 
    });
  }

  try {
    // Coluna G é a situação (índice 7)
    const range = `${sheetName}!G${rowIndex}`;
    
    await updateCell(range, novoStatus);

    return res.status(200).json({
      success: true,
      message: 'Status atualizado com sucesso',
      rowIndex,
      novoStatus,
    });

  } catch (error) {
    console.error('Erro na API PUT /updateStatus:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar status',
      details: error.message
    });
  }
}
