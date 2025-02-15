// pages/api/updateCardLimit.js
import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings';

export default async function handler(req, res) {

  try {
    const { id, newLimit } = req.body;
    if (!id || !newLimit) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Supondo que a folha se chama "API" e que a coluna M (limite) é a 13ª coluna (A=1, ..., M=13)
    // e que os dados começam na linha 2 (caso haja cabeçalho). 
    // Como o "id" é o número da linha na planilha, definimos o range para essa linha na coluna M.
    const range = `API!M${id}:M${id}`;

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newLimit]],
      },
    });

    return res.status(200).json({ success: true, result: result.data });
  } catch (error) {
    console.error('Error updating card limit:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
