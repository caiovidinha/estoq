import { GOOGLE_SERVICE_ACCOUNT_CREDENTIALS, SPREADSHEET_ID } from '@/data/data'
import { google } from 'googleapis';


/**
 * Função auxiliar para obter o sheetId a partir do nome da aba.
 */
async function getSheetId(sheets, sheetName) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties',
  });
  const sheetsArray = response.data.sheets;
  const sheet = sheetsArray.find((s) => s.properties.title === sheetName);
  if (!sheet) {
    throw new Error(`Planilha com o nome ${sheetName} não encontrada.`);
  }
  return sheet.properties.sheetId;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { index } = req.body;
    if (!index) {
      return res.status(400).json({ error: 'O campo "index" é obrigatório.' });
    }

    // Autenticação usando as credenciais já formatadas
    const auth = new google.auth.GoogleAuth({
      credentials: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Obtem o sheetId da aba "Extrato"
    const sheetId = await getSheetId(sheets, 'Extrato');

    /* 
      A API espera índices zero-indexados.
      Se "index" representa a linha da planilha (por exemplo, 5 para a linha 5),
      convertemos para zero-index: startIndex = index - 1 e endIndex = index (exclusivo)
    */
    const request = {
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: index - 1,
                endIndex: index,
              },
            },
          },
        ],
      },
    };

    const responseUpdate = await sheets.spreadsheets.batchUpdate(request);
    return res.status(200).json({ success: true, response: responseUpdate.data });
  } catch (error) {
    console.error('Erro ao excluir a linha:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}