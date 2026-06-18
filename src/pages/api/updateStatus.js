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
    const rangeStatus = `${sheetName}!G${rowIndex}`;
    
    await updateCell(rangeStatus, novoStatus);

    // Se marcar como Pago ou Recebido, atualiza a data para hoje
    if (novoStatus === 'Pago' || novoStatus === 'Recebido') {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const dataHoje = `${dia}/${mes}/${ano}`;
      
      // Coluna D é a data
      const rangeData = `${sheetName}!D${rowIndex}`;
      await updateCell(rangeData, dataHoje);
    }

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
