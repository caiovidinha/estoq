// pages/api/quitarPagamento.js
import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idPagamento } = req.body;
  if (!idPagamento) {
    return res.status(400).json({ error: 'Missing required field: idPagamento' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Ler o total de parcelas (coluna H) para a linha idPagamento
    const rangeParcelas = `Pagamentos!H${idPagamento}:H${idPagamento}`;
    const parcelasResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeParcelas,
    });
    let totalParcelas = 0;
    if (parcelasResp.data.values && parcelasResp.data.values[0] && parcelasResp.data.values[0][0]) {
      totalParcelas = parseInt(parcelasResp.data.values[0][0], 10) || 0;
    }

    // Atualiza o campo "RECEBIDAS/PAGAS" para igualar totalParcelas (quitado)
    const rangePagas = `Pagamentos!G${idPagamento}:G${idPagamento}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangePagas,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[totalParcelas]],
      },
    });

    // Cria um registro na aba "Extrato" informando a quitação
    const extratoRange = 'Extrato!A:H';
    const extratoRow = [
      'QUITADO', // Tipo
      `Quitação - ID ${idPagamento}`, // Descritivo
      '-', // Valor (opcional, ou pode calcular a diferença, se necessário)
      new Date().toLocaleDateString('pt-BR'), // Data atual como data do pagamento
      '', '', '', '',
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: extratoRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [extratoRow],
      },
    });

    return res.status(200).json({ success: true, quitado: totalParcelas });
  } catch (error) {
    console.error('Erro ao processar quitarPagamento:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
