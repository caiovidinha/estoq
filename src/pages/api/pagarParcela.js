// pages/api/pagarParcela.js
import { google } from 'googleapis';
import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from './settings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { idPagamento, valorPago, dataPagamento } = req.body;
  console.log(idPagamento, valorPago, dataPagamento)
  return
//   if (!idPagamento || !valorPago || !dataPagamento) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Atualiza o campo "RECEBIDAS/PAGAS" na aba "Pagamentos"
    // Supondo que o idPagamento é o número da linha (começando em 2)
    const rangePagas = `Pagamentos!G${idPagamento}:G${idPagamento}`;
    // Obtém o valor atual dessa célula
    const getResp = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangePagas,
    });
    let currentValue = 0;
    if (getResp.data.values && getResp.data.values[0] && getResp.data.values[0][0]) {
      currentValue = parseInt(getResp.data.values[0][0], 10) || 0;
    }
    const newValue = currentValue + 1;

    // Atualiza a célula com o novo valor
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: rangePagas,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newValue]],
      },
    });

    // Cria um registro na aba "Extrato" para o pagamento da parcela
    // Supondo um range "Extrato!A:H". Ajuste conforme necessário.
    const extratoRange = 'Extrato!A:H';
    const extratoRow = [
      // Aqui você pode definir os campos que desejar para o extrato:
      'PARCELA', // Tipo (ou outro identificador)
      `Pagamento Parcela - ID ${idPagamento}`, // Descritivo
      valorPago, // Valor pago
      dataPagamento, // Data do pagamento
      '', // Campo opcional
      '', // Campo opcional
      '', // Campo opcional
      '', // Campo opcional
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

    return res.status(200).json({ success: true, newRecebidas: newValue });
  } catch (error) {
    console.error('Erro ao processar pagarParcela:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
