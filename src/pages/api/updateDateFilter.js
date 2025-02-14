import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings'
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { data } = req.body; // valor que você deseja colocar na célula
    if (!data) {
      return res.status(400).json({ error: 'Campo "data" é obrigatório.' });
    }

    // Configura o cliente de autenticação usando as credenciais da conta de serviço
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Define a célula a ser atualizada
    const range = 'Categorias!C2';

    // Atualiza o valor na célula especificada
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED', // ou 'RAW', conforme a sua necessidade
      requestBody: {
        values: [[data]], // note que os valores devem ser passados como uma matriz de matrizes
      },
    });

    return res.status(200).json({ success: true, response: response.data });
  } catch (error) {
    console.error('Erro ao atualizar a planilha:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}