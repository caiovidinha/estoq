import { google } from 'googleapis';

/**
 * Serviço otimizado para Google Sheets
 * - Cache de autenticação
 * - Processamento eficiente de dados
 * - Tratamento robusto de erros
 */

// Cache de cliente autenticado
let cachedClient = null;

/**
 * Inicializa e retorna o cliente do Google Sheets (com cache)
 */
export async function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        // eslint-disable-next-line no-undef
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // eslint-disable-next-line no-undef
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Permissão de leitura E escrita
    });

    cachedClient = google.sheets({ version: 'v4', auth });
    return cachedClient;
  } catch (error) {
    console.error('Erro ao autenticar Google Sheets:', error);
    throw new Error('Falha na autenticação');
  }
}

/**
 * Busca dados de um range específico
 * @param {string} range - Ex: "Extrato!A:H"
 * @returns {Array<Array>} Matriz de dados
 */
export async function getRange(range) {
  try {
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
}

/**
 * Converte array de valores em objeto estruturado
 * @param {Array<Array>} data - Dados da planilha (primeira linha = headers)
 * @returns {Array<Object>} Array de objetos
 */
export function parseSheetData(data) {
  if (!data || data.length < 2) return [];

  const [headers, ...rows] = data;
  
  return rows.map((row, index) => {
    const obj = { rowIndex: index + 2 }; // +2 porque headers na linha 1, dados começam na 2
    
    headers.forEach((header, colIndex) => {
      obj[header.toLowerCase()] = row[colIndex] || '';
    });
    
    return obj;
  });
}

/**
 * Converte string DD/MM/YYYY para objeto Date
 */
export function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const [dia, mes, ano] = dateStr.split('/');
  if (!dia || !mes || !ano) return null;
  
  return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
}

/**
 * Filtra e ordena movimentações
 * @param {Array} movimentacoes - Array de movimentações
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Movimentações filtradas e ordenadas
 */
export function filterAndSortMovimentacoes(movimentacoes, filters = {}) {
  let result = [...movimentacoes];

  // Filtrar por situação (Paga ou Recebida)
  if (filters.situacao) {
    const situacoes = Array.isArray(filters.situacao) 
      ? filters.situacao 
      : [filters.situacao];
    
    result = result.filter(mov => 
      situacoes.some(s => mov.situação?.toLowerCase() === s.toLowerCase())
    );
  }

  // Filtrar por tipo (Receita/Despesa)
  if (filters.tipo) {
    result = result.filter(mov => 
      mov.tipo?.toLowerCase() === filters.tipo.toLowerCase()
    );
  }

  // Filtrar por mês
  if (filters.mes) {
    result = result.filter(mov => mov.mês === filters.mes);
  }

  // Filtrar por conta
  if (filters.conta) {
    result = result.filter(mov => mov.conta === filters.conta);
  }

  // Ordenar por data (mais recente primeiro), depois por ordem da planilha (rowIndex decrescente)
  result.sort((a, b) => {
    const dateA = parseDate(a.data);
    const dateB = parseDate(b.data);
    
    if (!dateA || !dateB) return 0;
    
    // Primeiro critério: data (mais recente primeiro)
    const dateDiff = dateB - dateA;
    if (dateDiff !== 0) return dateDiff;
    
    // Segundo critério: ordem da planilha (rowIndex decrescente = mais recente na planilha primeiro)
    return (b.rowIndex || 0) - (a.rowIndex || 0);
  });

  // Limitar quantidade
  if (filters.limit) {
    result = result.slice(0, filters.limit);
  }

  return result;
}

/**
 * Busca o saldo geral da célula API!A2
 * @returns {string} Valor do saldo (ex: "R$ 1.234,56")
 */
export async function getSaldoGeral() {
  try {
    const data = await getRange('API!A2');
    return data[0]?.[0] || 'R$ 0,00';
  } catch (error) {
    console.error('Erro ao buscar saldo geral:', error);
    return 'R$ 0,00';
  }
}

/**
 * Busca as contas e seus saldos de API!O:P
 * @returns {Array<{conta: string, saldo: string}>} Array de contas com saldos
 */
export async function getContasSaldos() {
  try {
    const data = await getRange('API!O:P');
    
    if (!data || data.length < 2) return [];
    
    const [headers, ...rows] = data;
    
    return rows.map(row => ({
      conta: row[0] || '',
      saldo: row[1] || 'R$ 0,00'
    })).filter(item => item.conta); // Remove linhas vazias
  } catch (error) {
    console.error('Erro ao buscar contas e saldos:', error);
    return [];
  }
}

/**
 * Busca categorias de Configurações!A2:A
 * @returns {Array<string>} Array de nomes de categorias
 */
export async function getCategorias() {
  try {
    const data = await getRange('Configurações!A2:A');
    
    // data é array de arrays: [["Categoria1"], ["Categoria2"], ...]
    return data.map(row => row[0]).filter(cat => cat); // Remove vazios
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

/**
 * Busca meses de Configurações!G2:G
 * @returns {Array<string>} Array de nomes de meses
 */
export async function getMeses() {
  try {
    const data = await getRange('Configurações!G2:G');
    
    return data.map(row => row[0]).filter(mes => mes); // Remove vazios
  } catch (error) {
    console.error('Erro ao buscar meses:', error);
    return [];
  }
}

/**
 * Busca contas de Configurações!D2:D
 * @returns {Array<string>} Array de nomes de contas
 */
export async function getContasConfig() {
  try {
    const data = await getRange('Configurações!D2:D');
    
    return data.map(row => row[0]).filter(conta => conta); // Remove vazios
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    return [];
  }
}

/**
 * Busca cartões de crédito de Configurações!E2:E
 * @returns {Array<string>} Array de nomes de cartões
 */
export async function getCartoesConfig() {
  try {
    const data = await getRange('Configurações!E2:E');
    
    return data.map(row => row[0]).filter(cartao => cartao); // Remove vazios
  } catch (error) {
    console.error('Erro ao buscar cartões:', error);
    return [];
  }
}

/**
 * Busca mapeamento de categorias e ícones de Configurações!A2:F
 * Retorna objeto { categoria: iconName }
 * @returns {Object} Objeto com mapeamento categoria → nome do ícone
 */
export async function getCategoryIconMapping() {
  try {
    const data = await getRange('Configurações!A2:F');
    
    // Mapeamento de ícones deprecados para substitutos
    const iconMapping = {
      'BsPaw': 'BsHeart',
      'BsCar': 'BsBusFront',
      'BsTrain': 'BsBusFront',
      'BsMusic': 'BsController',
      'BsBicycle': 'BsBusFront'
    };
    
    const mapping = {};
    data.forEach(row => {
      const categoria = row[0]; // Coluna A
      let iconName = row[5];    // Coluna F (índice 5)
      
      if (categoria && iconName) {
        // Substituir ícone se estiver deprecado
        iconName = iconMapping[iconName] || iconName;
        mapping[categoria] = iconName;
      }
    });
    
    return mapping;
  } catch (error) {
    console.error('Erro ao buscar mapeamento de ícones:', error);
    return {};
  }
}

/**
 * Adiciona uma nova linha em uma planilha
 * @param {string} range - Range da planilha (ex: "Extrato!A:H")
 * @param {Array} values - Array de valores para adicionar (ex: ["RECEITA", "Salário", "R$ 5000,00", ...])
 * @returns {Object} Resposta da API
 */
async function appendRow(range, values) {
  try {
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED', // Interpreta valores (fórmulas, datas, etc)
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [values], // Array de array
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar linha:', error);
    throw error;
  }
}

/**
 * Cria uma nova transação em Extrato!A:H
 * Formato: TIPO | DESCRITIVO | VALOR | DATA | MÊS | DETALHES | SITUAÇÃO | CONTA
 * 
 * @param {Object} transacao - Dados da transação
 * @param {string} transacao.tipo - "RECEITA" ou "DESPESA"
 * @param {string} transacao.descritivo - Nome/descrição da transação
 * @param {string} transacao.valor - Valor formatado (ex: "R$ 150,00")
 * @param {string} transacao.data - Data no formato DD/MM/YYYY
 * @param {string} transacao.mes - Nome do mês
 * @param {string} transacao.detalhes - Detalhes adicionais (opcional)
 * @param {string} transacao.situacao - "Paga", "Recebida", "A pagar", etc
 * @param {string} transacao.conta - Nome da conta
 * @returns {Object} Resposta da API
 */
export async function createTransacao(transacao) {
  try {
    const row = [
      transacao.tipo || '',
      transacao.descritivo || '',
      transacao.valor || '',
      transacao.data || '',
      transacao.mes || '',
      transacao.detalhes || '',
      transacao.situacao || '',
      transacao.conta || '',
      transacao.fixa ? 'TRUE' : 'FALSE', // Coluna I - Fixa (checkbox)
    ];

    const result = await appendRow('Extrato!A:I', row);
    console.log('Transação criada com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    throw error;
  }
}

/**
 * Cria uma nova transação de crédito em 'Extrato Crédito'!A:I
 * Formato: TIPO | DESCRITIVO | VALOR | DATA | MÊS | DETALHES | SITUAÇÃO | CARTÃO
 * 
 * @param {Object} transacao - Dados da transação de crédito
 * @param {string} transacao.tipo - "RECEITA" ou "DESPESA"
 * @param {string} transacao.descritivo - Nome/descrição da transação
 * @param {string} transacao.valor - Valor formatado (ex: "R$ 150,00")
 * @param {string} transacao.data - Data no formato DD/MM/YYYY
 * @param {string} transacao.mes - Nome do mês
 * @param {string} transacao.detalhes - Detalhes adicionais (opcional)
 * @param {string} transacao.situacao - "Paga", "Recebida", "A pagar", etc
 * @param {string} transacao.cartao - Nome do cartão de crédito
 * @returns {Object} Resposta da API
 */
export async function createTransacaoCredito(transacao) {
  try {
    const row = [
      transacao.tipo || '',
      transacao.descritivo || '',
      transacao.valor || '',
      transacao.data || '',
      transacao.mes || '',
      transacao.detalhes || '',
      transacao.situacao || '',
      transacao.cartao || '',
      transacao.fixa ? 'TRUE' : 'FALSE', // Coluna I - Fixa (checkbox)
    ];

    const result = await appendRow('Extrato Crédito!A:I', row);
    console.log('Transação de crédito criada com sucesso:', result);
    return result;
  } catch (error) {
    console.error('Erro ao criar transação de crédito:', error);
    throw error;
  }
}

/**
 * Atualiza uma célula específica na planilha
 * @param {string} range - Range da célula (ex: "Extrato!G5" para atualizar situação)
 * @param {string} value - Novo valor
 * @returns {Object} Resposta da API
 */
export async function updateCell(range, value) {
  try {
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[value]],
      },
    });

    console.log('Célula atualizada:', range, '=', value);
    return result.data;
  } catch (error) {
    console.error('Erro ao atualizar célula:', error);
    throw error;
  }
}

/**
 * Deleta uma linha da planilha
 * @param {string} sheetName - Nome da aba (ex: "Extrato")
 * @param {number} rowIndex - Índice da linha (baseado em 0, onde 0 é o cabeçalho)
 * @returns {Object} Resposta da API
 */
export async function deleteRow(sheetName, rowIndex) {
  try {
    const sheets = await getClient();
    // eslint-disable-next-line no-undef
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    // Primeiro, precisa obter o sheetId da aba
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`Aba "${sheetName}" não encontrada`);
    }

    const sheetId = sheet.properties.sheetId;

    // Deleta a linha usando batchUpdate
    const result = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    console.log(`Linha ${rowIndex} deletada da aba ${sheetName}`);
    return result.data;
  } catch (error) {
    console.error('Erro ao deletar linha:', error);
    throw error;
  }
}

