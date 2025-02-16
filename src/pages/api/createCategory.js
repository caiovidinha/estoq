import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings';

export default async function handler(req, res) {

  try {
    const { name, type, icon } = req.body;
    if (!name || !type || !icon) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Linha a ser inserida: [Nome, Tipo, Icon]
    const values = [[name, type, icon]];
    const range = 'Categories!A:C'; // Ajuste se precisar de mais colunas

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    return res.status(200).json({ success: true, result: result.data });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
