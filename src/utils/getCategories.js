// src/utils/getCategories.js
export async function fetchCategories() {
    const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
    const SHEET_TITLE = 'Categories';
    const SHEET_RANGE = 'A:C';
    const FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;
  
    try {
      const res = await fetch(FULL_URL);
      const text = await res.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      let catList = [];
      for (let i = 0; i < data.table.rows.length; i++) {
        const nome = data.table.rows[i].c[0]?.v || '';
        const tipo = data.table.rows[i].c[1]?.v || '';
        const icone = data.table.rows[i].c[2]?.v || 'BsThreeDots';
        catList.push({ nome, tipo, icone });
      }
      return catList;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return [];
    }
  }
  