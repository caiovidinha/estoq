import { deleteRow as deleteSheetRow } from '@/lib/sheets';

/**
 * API Route: DELETE /api/deleteRow
 * Deleta uma linha da planilha
 * 
 * Body:
 * - rowIndex: número da linha na planilha (ex: 5 para linha 5)
 * - sheetName: "Extrato" ou "Extrato Crédito" (opcional, padrão: "Extrato")
 */
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { rowIndex, sheetName = 'Extrato' } = req.body;

  if (!rowIndex) {
    return res.status(400).json({ 
      error: 'rowIndex é obrigatório' 
    });
  }

  try {
    // rowIndex vem baseado em 1 (primeira linha = 1)
    // Mas a função deleteRow espera baseado em 0
    // E precisamos considerar que linha 1 é o cabeçalho
    // Então linha de dados 2 = índice 1 (cabeçalho = 0, dados começam em 1)
    const zeroBasedIndex = rowIndex - 1;
    
    await deleteSheetRow(sheetName, zeroBasedIndex);

    return res.status(200).json({
      success: true,
      message: 'Linha deletada com sucesso',
      rowIndex,
    });

  } catch (error) {
    console.error('Erro na API DELETE /deleteRow:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao deletar linha',
      details: error.message
    });
  }
}
