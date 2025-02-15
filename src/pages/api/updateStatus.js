import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings'
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const { situacao, index } = req.body;
    if (!situacao || !index) {
      return res
        .status(400)
        .json({ error: 'Os campos "situacao" e "index" são obrigatórios.' });
    }

    // Autenticação com as credenciais da conta de serviço
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Supondo que o status esteja na coluna G da aba "Extrato"
    const range = `Extrato!G${index}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED', // Ou "RAW" se preferir sem interpretação
      requestBody: {
        values: [[situacao]],
      },
    });

    return res.status(200).json({ success: true, response: response.data });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
