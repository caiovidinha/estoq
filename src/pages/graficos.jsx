// pages/graficos.jsx
import React, { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Container,
  Card,
  Grid,
  Text,
  Dropdown,
  Spacer
} from '@nextui-org/react';
import {
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Chart
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const GraficosPage = () => {
  // Filtros: Ano, Mês e Tipo (DESPESA ou RECEITA)
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedTransactionType, setSelectedTransactionType] = useState('DESPESA');
  
  // Dados para gráficos
  const [categoriesData, setCategoriesData] = useState([]); // [{ nome, tipo, soma }]
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
  // Use o nome correto da aba: se você mudou para "Categories" ou "Categorias"
  const FULL_URL_CATEGORIAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Categories&range=A2:C`;
  const FULL_URL_EXTRATO = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Extrato&range=A:H`;

  // Funções de conversão de mês
  const monthName = (m) => {
    const mapping = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    return mapping[m] || 'Janeiro';
  };

  const convertMonthNameToNumber = (name) => {
    const mapping = {
      'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
      'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
      'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
    };
    return mapping[name] || '01';
  };

  // Função para converter valor (assumindo que a planilha usa "R$ 620,54" ou "620,54")
  const parseSheetValue = (rawValue) => {
    let valorStr = rawValue?.toString() || '0';
    valorStr = valorStr.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(valorStr) || 0;
  };

  // Busca categorias da aba "Categorias"
  const fetchCategorias = async () => {
    try {
      const res = await fetch(FULL_URL_CATEGORIAS);
      const text = await res.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      let catList = [];
      for (let i = 0; i < data.table.rows.length; i++) {
        const nome = data.table.rows[i].c[0]?.v || '';
        const tipo = data.table.rows[i].c[1]?.v || '';
        const icone = data.table.rows[i].c[2]?.v || 'BsThreeDots';
        catList.push({ nome, tipo, icone, soma: 0 });
      }
      return catList;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return [];
    }
  };

  // Busca o extrato e agrupa por categoria filtrando por data e pelo tipo (receita/despesa)
  const fetchExtrato = async () => {
    try {
      const res = await fetch(FULL_URL_EXTRATO);
      const text = await res.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      let agrupado = {};
      let totalSoma = 0;
  
      // row[0] = tipo (DESPESA/RECEITA)
      // row[1] = categoria
      // row[2] = valor (ex: "R$ 620.547,00")
      // row[3] = data (ex: "Date(2025,0,30)")
      for (let i = 0; i < data.table.rows.length; i++) {
        const row = data.table.rows[i].c;
        const tipoRow = row[0]?.v || '';
        const categoria = row[1]?.v || '';
  
        // Converte o valor usando a função parseSheetValue
        const valor = row[2]?.v > 0 ? row[2]?.v : (row[2]?.v * -1);
  
        // Lida com a data no formato "Date(2025,0,30)"
        const dataStr = row[3]?.v || '';
        const match = dataStr.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (match) {
          const anoData = match[1]; // "2025"
          const mesData = String(Number(match[2]) + 1).padStart(2, '0'); // 0 => "01"
          // Compare com os filtros
          if (
            anoData === String(year) &&
            mesData === month &&
            tipoRow.toUpperCase() === selectedTransactionType
          ) {
            if (!agrupado[categoria]) {
              agrupado[categoria] = 0;
            }
            agrupado[categoria] += valor;
            totalSoma += valor;
          }
        }
      }
      return { agrupado, totalSoma };
    } catch (error) {
      console.error('Erro ao carregar extrato:', error);
      return { agrupado: {}, totalSoma: 0 };
    }
  }
  

  const loadData = async () => {
    const catList = await fetchCategorias();
    const { agrupado, totalSoma } = await fetchExtrato();
    // Filtra as categorias para exibir somente as do tipo selecionado
    const finalList = catList
      .filter(cat => cat.tipo.toUpperCase() === selectedTransactionType)
      .map(cat => ({
        ...cat,
        soma: agrupado[cat.nome] ? agrupado[cat.nome] : 0,
      }));
    // Recalcula o total com base na lista final
    const finalTotal = finalList.reduce((acc, cat) => acc + cat.soma, 0);
    setCategoriesData(finalList);
    setTotal(finalTotal);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [year, month, selectedTransactionType]);

  // Prepara os dados para o gráfico de pizza
  const pieChartData = {
    labels: categoriesData.map(cat => cat.nome),
    datasets: [
      {
        data: categoriesData.map(cat => cat.soma),
        backgroundColor: categoriesData.map((_, idx) => {
          const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
          return colors[idx % colors.length];
        }),
      },
    ],
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <title>Gráficos - CF</title>
      <h2 className="text-2xl font-bold mb-4">Gráficos e Análises</h2>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          id="ano"
          className="w-20 bg-blue-800 p-1 rounded-lg text-blue-200 font-semibold"
          onChange={(e) => setYear(e.target.value)}
          value={year}
        >
          {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => {
            const y = 2023 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>
        <select
          id="mes"
          className="w-32 bg-blue-200 p-1 rounded-lg text-blue-800 font-semibold"
          onChange={(e) => setMonth(convertMonthNameToNumber(e.target.value))}
          value={monthName(month)}
        >
          <option>Janeiro</option>
          <option>Fevereiro</option>
          <option>Março</option>
          <option>Abril</option>
          <option>Maio</option>
          <option>Junho</option>
          <option>Julho</option>
          <option>Agosto</option>
          <option>Setembro</option>
          <option>Outubro</option>
          <option>Novembro</option>
          <option>Dezembro</option>
        </select>
        <select
          id="tipo"
          className="w-32 bg-blue-200 p-1 rounded-lg text-blue-800 font-semibold"
          onChange={(e) => setSelectedTransactionType(e.target.value.toUpperCase())}
          value={selectedTransactionType}
        >
          <option value="DESPESA">Despesas</option>
          <option value="RECEITA">Receitas</option>
        </select>
      </div>

      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <>
          {/* Gráfico de Pizza e Tabela resumo organizados em Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold mb-2">Distribuição por Categoria</h4>
              <div className="w-full">
                <Pie data={pieChartData} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold mb-2">Resumo por Categoria</h4>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Categoria</th>
                    <th className="border p-2">Valor</th>
                    <th className="border p-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesData.map((cat, index) => {
                    const somaFormatada = cat.soma.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                    const perc = total ? ((cat.soma / total) * 100).toFixed(2) : 0;
                    return (
                      <tr key={index} className="cursor-pointer" onClick={() => {/* opcional: abrir modal de detalhes */}}>
                        <td className="border p-2">{cat.nome}</td>
                        <td className="border p-2">R$ {somaFormatada}</td>
                        <td className="border p-2">{perc.replace('.',',')}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Se quiser adicionar outros gráficos (ex: barras, linha), pode incluir outra grid abaixo */}
          <Spacer y={1} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold mb-2">Comparativo Mensal (Exemplo)</h4>
              {/* Exemplo de gráfico de barras com dados simulados */}
              <Bar data={{
                labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [
                  {
                    label: selectedTransactionType === 'DESPESA' ? 'Despesas' : 'Receitas',
                    data: [100,150,200,120,180,130,170,190,110,160,140,200],
                    backgroundColor: 'rgba(54,162,235,0.6)',
                  }
                ]
              }} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-bold mb-2">Evolução do Saldo (Exemplo)</h4>
              {/* Exemplo de gráfico de linha com dados simulados */}
              <Line data={{
                labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
                datasets: [
                  {
                    label: 'Saldo',
                    data: [50,80,70,100,120,90,110,130,120,140,150,160],
                    fill: false,
                    borderColor: 'rgba(75,192,192,1)',
                    tension: 0.1,
                  }
                ]
              }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GraficosPage;
