import React, { useState, useEffect } from 'react';
import AddCategoryModal from '@/components/AddCategoryModal';
import { Modal, Progress, Text, Button } from '@nextui-org/react';
import { CiCirclePlus } from "react-icons/ci";
import { BsThreeDots } from 'react-icons/bs';
import {
  BiRestaurant,
  BiCar,
  BiPhone,
  BiSolidTShirt,
  BiBomb,
  BiSmile,
  BiGift,
  BiMoneyWithdraw,
} from 'react-icons/bi';
import { MdMoneyOff } from 'react-icons/md';
import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi';
import { SiBetfair, SiFreelancer, SiYourtraveldottv } from 'react-icons/si';
import { AiOutlineTool } from 'react-icons/ai';
import { RiFundsBoxLine, RiBillLine } from 'react-icons/ri';

// Mapeamento dos ícones conforme o valor gravado na planilha
const ICON_MAP = {
  BiRestaurant: <BiRestaurant size={20} className="text-blue-800" />,
  BiCar: <BiCar size={20} className="text-blue-800" />,
  GiWeightLiftingUp: <GiWeightLiftingUp size={20} className="text-blue-800" />,
  BiPhone: <BiPhone size={20} className="text-blue-800" />,
  BiSolidTShirt: <BiSolidTShirt size={20} className="text-blue-800" />,
  BiBomb: <BiBomb size={20} className="text-blue-800" />,
  BiSmile: <BiSmile size={20} className="text-blue-800" />,
  GiHealthNormal: <GiHealthNormal size={20} className="text-blue-800" />,
  SiBetfair: <SiBetfair size={20} className="text-blue-800" />,
  BiGift: <BiGift size={20} className="text-blue-800" />,
  AiOutlineTool: <AiOutlineTool size={20} className="text-blue-800" />,
  RiFundsBoxLine: <RiFundsBoxLine size={20} className="text-green-800" />,
  RiBillLine: <RiBillLine size={20} className="text-blue-800" />,
  BiMoneyWithdraw: <BiMoneyWithdraw size={20} className="text-green-800" />,
  SiFreelancer: <SiFreelancer size={20} className="text-green-800" />,
  MdMoneyOff: <MdMoneyOff size={20} className="text-green-800" />,
  SiYourtraveldottv: <SiYourtraveldottv size={20} className="text-blue-800" />,
  BsThreeDots: <BsThreeDots size={20} className="text-blue-800" />,
};

const categorias = () => {
  // Estados para filtro de data e de tipo (receita/despesa)
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [selectedTransactionType, setSelectedTransactionType] = useState('DESPESA'); // ou "RECEITA"
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [categorias, setCategorias] = useState([]); // Ex: [{ nome, tipo, icone, soma }]
  const [total, setTotal] = useState(0);
  const [detalhes, setDetalhes] = useState([]); // Detalhes das transações filtradas
  const [visible, setVisible] = useState(false);
  const [catModal, setCatModal] = useState('');

  // IDs e ranges da planilha
  const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
  const FULL_URL_CATEGORIAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Categories&range=A2:C`;
  const FULL_URL_EXTRATO = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Extrato&range=A:H`;

  // Converte número do mês para nome
  const monthName = (m) => {
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return names[parseInt(m, 10) - 1] || '';
  };

  // Converte nome do mês para número (formato "01", etc.)
  const convertMonthNameToNumber = (name) => {
    const names = {
      'Janeiro': '01',
      'Fevereiro': '02',
      'Março': '03',
      'Abril': '04',
      'Maio': '05',
      'Junho': '06',
      'Julho': '07',
      'Agosto': '08',
      'Setembro': '09',
      'Outubro': '10',
      'Novembro': '11',
      'Dezembro': '12'
    };
    return names[name] || '01';
  };

  function parseSheetValue(rawValue) {
    // Se não vier nada, assume '0'
    let valorStr = rawValue?.toString() || '0';
  
    // Logs para depuração
    console.log('Valor bruto da planilha:', valorStr);
  
    // Remove "R$" e possíveis espaços
    valorStr = valorStr.replace(/R\$\s?/, '');
    // Remove pontos de milhar
    valorStr = valorStr.replace(/\./g, '');
    // Troca a vírgula decimal por ponto
    valorStr = valorStr.replace(',', '.');
  
    console.log('Valor após remover pontuação:', valorStr);
  
    const valorNum = parseFloat(valorStr) || 0;
    console.log('Valor parseado:', valorNum);
  
    return valorNum;
  }
  

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
  
  

  // Junta categorias e extrato
  const loadData = async () => {
    const catList = await fetchCategorias();
    const { agrupado, totalSoma } = await fetchExtrato();
    const finalList = catList
      // Filtra apenas as categorias cujo tipo bate com o selecionado
      .filter(cat => cat.tipo.toUpperCase() === selectedTransactionType)
      .map(cat => ({
        ...cat,
        soma: agrupado[cat.nome] ? agrupado[cat.nome] : 0
      }));
    // Recalcula o total com base na lista final
    const finalTotal = finalList.reduce((acc, cat) => acc + cat.soma, 0);
    setCategorias(finalList);
    setTotal(finalTotal);
  };

  // Chama loadData ao mudar filtros
  useEffect(() => {
    loadData();
  }, [year, month, selectedTransactionType]);

  // Atualiza detalhes quando uma categoria é clicada
  const detailCategory = async (categoria) => {
    try {
      const res = await fetch(FULL_URL_EXTRATO);
      const text = await res.text();
      const data = JSON.parse(text.substr(47).slice(0, -2));
      let detalhesList = [];
      // Supondo:
      // row[0]: tipo
      // row[1]: categoria
      // row[2]: valor
      // row[3]: data ("Date(2025,0,30)")
      // row[5]: detalhes (descrição)
      for (let i = 0; i < data.table.rows.length; i++) {
        const row = data.table.rows[i].c;
        const tipoRow = row[0]?.v || '';
        const catRow = row[1]?.v || '';
        
        // Processa o valor
        const valor = row[2]?.v > 0 ? row[2]?.v : (row[2]?.v * -1);
        
        // Processa a data no formato "Date(2025,0,30)"
        const dataStr = row[3]?.v || '';
        const match = dataStr.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (match) {
          const anoData = match[1];
          const mesData = String(Number(match[2]) + 1).padStart(2, '0');
          const diaData = String(match[3]).padStart(2, '0');
          if (
            anoData === String(year) &&
            mesData === month &&
            catRow === categoria &&
            tipoRow.toUpperCase() === selectedTransactionType
          ) {
            detalhesList.push({
              id: i,
              detalhes: row[5]?.v || '',
              valor,
              data: `${diaData}/${mesData}/${anoData}`,
            });
          }
        }
      }
      setDetalhes(detalhesList);
      setCatModal(categoria);
      setVisible(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes da categoria:', error);
    }
  };
  

  return (
    <div className="bg-gray-100 min-h-screen">
      <title>Categorias - CF</title>
      <div className="p-4">
        {/* Filtros: Ano, Mês e Tipo (Receita/Despesa) */}
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

        {/* Lista de Categorias */}
        <ul>
          {categorias.map((cat, index) => {
            const somaFormatada = cat.soma.toFixed(2).replace('.', ',');
            const perc = total ? ((cat.soma / total) * 100).toFixed(2) : 0;
            return (
              <li
                key={index}
                className="bg-gray-50 rounded-lg my-3 p-3 grid grid-cols-2 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-blue-200 mr-4 w-11 h-11 flex justify-center items-center">
                    {ICON_MAP[cat.icone] || ICON_MAP['BsThreeDots']}
                  </div>
                  <Text b>{cat.nome}</Text>
                </div>
                <div className="flex items-center">
                  <div className="mr-3">
                    <Progress className="w-40" color="primary" value={Number(perc)} />
                  </div>
                  <div
                    className="text-blue-700 font-bold"
                    onClick={() => detailCategory(cat.nome)}
                  >
                    R$ {somaFormatada} ({perc.toString().replace(".",",")}%)
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Modal com detalhes das transações da categoria */}
      <Modal closeButton open={visible} onClose={() => setVisible(false)}>
        <Modal.Header>
          <Text id="modal-title" size={18}>
            <Text b>
              {catModal} - {monthName(month)}/{year}
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body className="text-center">
          <ul>
            {detalhes
              .slice(0)
              .reverse()
              .map((mov, index) => (
                <li
                  key={index}
                  className="bg-gray-50 rounded-lg my-3 p-2 flex justify-between items-center"
                >
                  <div className="flex flex-col">
                    <Text b>{mov.detalhes}</Text>
                    <Text className="text-red-700">
                      R$ {mov.valor.toFixed(2).replace('.', ',')}
                    </Text>
                  </div>
                  <Text>{mov.data}</Text>
                </li>
              ))}
          </ul>
        </Modal.Body>
      </Modal>
      <div className="fixed bottom-4 right-4">
        <Button
          className="bg-green-500 rounded-full h-12 w-12 flex justify-center items-center"
          auto
          onPress={() => setShowAddModal(true)}
        >
          <CiCirclePlus size={26}/>
        </Button>
        {showAddModal && (
        <AddCategoryModal onClose={() => setShowAddModal(false)} />
      )}
      </div>
    </div>
  );
};

export default categorias;
