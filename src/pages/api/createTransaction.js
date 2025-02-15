// pages/api/createTransaction.js
import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings';

export default async function handler(req, res) {

  try {
    // Extrai os dados enviados pelo formulário
    const { tipo, categoria, valor, data, mes, descricao, status, conta } = req.body;
    if (!tipo || !categoria || !valor || !data || !mes || !descricao || !status || !conta) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // As credenciais e o ID da planilha já estão importados do arquivo settings
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Define a faixa onde inserir a nova linha. 
    // Supondo que a ordem das colunas seja:
    // A: tipo, B: categoria, C: valor, D: data, E: mes, F: descricao, G: status, H: conta
    const range = 'Extrato!A:H';
    const values = [[tipo, categoria, valor, data, mes, descricao, status, conta]];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED', // ou 'RAW' conforme sua necessidade
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    return res.status(200).json({ success: true, result: result.data });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
