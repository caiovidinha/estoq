import { getClient } from '@/lib/sheets';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { nome, icone } = req.body;

    if (!nome || !icone) {
      return res.status(400).json({ success: false, message: 'Nome e ícone são obrigatórios' });
    }

    // Mapeamento de ícones deprecados para substitutos
    const iconMapping = {
      'BsPaw': 'BsHeart',
      'BsCar': 'BsBusFront',
      'BsTrain': 'BsBusFront',
      'BsMusic': 'BsController',
      'BsBicycle': 'BsBusFront'
    };

    // Substituir ícone se estiver deprecado
    const iconeAtualizado = iconMapping[icone] || icone;

    // Usar client do sheets.js que já tem autenticação configurada
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // Buscar a próxima linha vazia na coluna A (Configurações)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Configurações!A:A',
    });

    const values = response.data.values || [];
    const nextRow = values.length + 1;

    // Adicionar a nova categoria
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Configurações!A${nextRow}:F${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[nome, '', '', '', '', iconeAtualizado]], // A=nome, F=icone (colunas B,C,D,E vazias)
      },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Categoria adicionada com sucesso',
      row: nextRow,
      iconeUsado: iconeAtualizado
    });

  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao adicionar categoria',
      error: error.message 
    });
  }
}
