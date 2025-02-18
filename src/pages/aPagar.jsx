import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import {
  BiRestaurant,
  BiCar,
  BiPhone,
  BiSolidTShirt,
  BiCreditCardAlt,
  BiBomb,
  BiSmile,
  BiGift,
  BiMoneyWithdraw,
} from 'react-icons/bi';
import { MdMoneyOff } from 'react-icons/md';
import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi';
import { SiBetfair, SiFreelancer, SiYourtraveldottv } from 'react-icons/si';
import { AiOutlineTool, AiFillCheckCircle } from 'react-icons/ai';
import { RiFundsBoxLine, RiBillLine, RiDeleteBin2Fill } from 'react-icons/ri';
import { Modal, Button, Text, Loading } from '@nextui-org/react';
import { Mov } from '@/components/Mov';

// Mapeamento dos ícones (string → componente)
const IconComponents = {
  BiRestaurant,
  BiCar,
  BiPhone,
  BiSolidTShirt,
  BiCreditCardAlt,
  BiBomb,
  BiSmile,
  BiGift,
  BiMoneyWithdraw,
  MdMoneyOff,
  GiWeightLiftingUp,
  GiHealthNormal,
  SiBetfair,
  SiFreelancer,
  SiYourtraveldottv,
  AiOutlineTool,
  RiFundsBoxLine,
  RiBillLine,
  BsThreeDots,
};

// Função que retorna o ícone para uma movimentação com base na categoria dinâmica  
function getIconForMovimentacao(mov, categoriesMapping) {
  // Compara de forma case-insensitive, removendo espaços
  const catFound = categoriesMapping.find(
    (c) =>
      c.nome.trim().toLowerCase() === mov.descritivo.trim().toLowerCase()
  );
  const iconName = catFound ? catFound.icone : 'BsThreeDots';
  const IconComponent = IconComponents[iconName] || BsThreeDots;
  const colorClass =
    mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <IconComponent size={20} className={colorClass} />;
}

const Apagar = () => {
  // Estados de filtros e modais
  const [filterMes, setFilterMes] = useState('');
  const [filterAno, setFilterAno] = useState('');
  const [update, setUpdate] = useState(false);
  const [movimentacao, setMovimentacao] = useState([]);
  const [categoriesMapping, setCategoriesMapping] = useState([]);
  
  // Estados dos totais (opcional)
  const [receber, setReceber] = useState(0);
  const [pagar, setPagar] = useState(0);
  
  // Estados para o modal de detalhes
  const [visible, setVisible] = useState(false);
  const [tipo, setTipo] = useState('');
  const [descritivo, seteDescritivo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [mes, setMes] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [situacao, setSituacao] = useState('');
  const [conta, setConta] = useState('');
  
  // Estados para exclusão
  const [post, setPost] = useState({});
  const [confirmarExc, setConfirmarExc] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [loading, setLoading] = useState(false);

  // URLs da planilha
  const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
  const FULL_URL_MOV =
    'https://docs.google.com/spreadsheets/d/' +
    SHEET_ID +
    '/gviz/tq?sheet=Extrato&range=A:H';
  const FULL_URL_CATS =
    'https://docs.google.com/spreadsheets/d/' +
    SHEET_ID +
    '/gviz/tq?sheet=Categories&range=A2:C';

  // Configura o filtro inicial de data
  useEffect(() => {
    const hoje = new Date().toISOString();
    const mesNum = hoje.slice(5, 7);
    const anoNum = hoje.slice(0, 4);
    setFilterMes(mesNum);
    setFilterAno(anoNum);
    setUpdate(true);
  }, []);

  // Função para converter nome do mês para número
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

  const monthName = (m) => {
    const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return names[parseInt(m, 10) - 1] || '';
  };

  // Função para converter valores monetários
  function parseSheetValue(rawValue) {
    let valorStr = rawValue?.toString() || '0';
    console.log('Valor bruto da planilha:', valorStr);
    valorStr = valorStr.replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    console.log('Valor após remover pontuação:', valorStr);
    const valorNum = parseFloat(valorStr) || 0;
    console.log('Valor parseado:', valorNum);
    return valorNum;
  }

  // Carrega as movimentações da aba "Extrato" filtrando por mês/ano e por situação ("A pagar" ou "A receber")
  useEffect(() => {
    fetch(FULL_URL_MOV)
      .then((res) => res.text())
      .then((rep) => {
        let data = JSON.parse(rep.substr(47).slice(0, -2));
        let produto = new Mov();
        for (let i = 0; i < data.table.rows.length; i++) {
          let date = data.table.rows[i].c[3].v;
          // Remove caracteres indesejados e formata a data
          date = date.replace(/[^0-9,]/g, '');
          if (date[6] === ',') {
            date = date.slice(0, 5) + '0' + date.slice(5);
          }
          let mesData = parseInt(date.slice(5, 7)) + 1;
          if (mesData < 10) mesData = '0' + mesData.toString();
          let anoData = date.slice(0, 4);
          if (filterMes === mesData && filterAno === anoData) {
            // Filtra movimentações com situação "A pagar" ou "A receber"
            if (data.table.rows[i].c[6].v === 'A pagar' || data.table.rows[i].c[6].v === 'A receber') {
              produto.salvar(
                i + 3,
                data.table.rows[i].c[0].v, // tipo
                data.table.rows[i].c[1].v, // descritivo (aqui usamos como categoria)
                data.table.rows[i].c[2].v.toFixed(2), // valor
                data.table.rows[i].c[3].v, // data
                data.table.rows[i].c[4].v, // mês/fatura
                data.table.rows[i].c[5].v, // detalhes
                data.table.rows[i].c[6].v, // situação
                data.table.rows[i].c[7].v  // conta
              );
            }
          }
        }
        // Ordena as movimentações por data (crescentes)
        produto.arrayMov = produto.arrayMov.sort((a, b) => {
          let [dayA, monthA, yearA] = a.data.split('/');
          let [dayB, monthB, yearB] = b.data.split('/');
          return new Date(+yearA, +monthA - 1, +dayA) - new Date(+yearB, +monthB - 1, +dayB);
        });
        setMovimentacao(produto.arrayMov);
      });
  }, [filterMes, filterAno]);

  // Carrega o mapeamento dinâmico de categorias
  useEffect(() => {
    fetch(FULL_URL_CATS)
      .then((res) => res.text())
      .then((rep) => {
        const data = JSON.parse(rep.substr(47).slice(0, -2));
        let catList = [];
        for (let i = 0; i < data.table.rows.length; i++) {
          const row = data.table.rows[i].c;
          const nome = row[0]?.v || '';
          const tipo = row[1]?.v || '';
          const icone = row[2]?.v || 'BsThreeDots';
          catList.push({ nome, tipo, icone });
        }
        setCategoriesMapping(catList);
      })
      .catch(err => console.error('Erro ao buscar categorias:', err));
  }, []);

  // Handler do modal de detalhes
  const handler = (
    tipo,
    descritivo,
    valor,
    data,
    mes,
    detalhes,
    situacao,
    conta
  ) => {
    setTipo(tipo);
    seteDescritivo(descritivo);
    setValor(valor);
    setData(data);
    setMes(mes);
    setDetalhes(detalhes);
    setSituacao(situacao);
    setConta(conta);
    setVisible(true);
  };

  const closeHandler = () => {
    setVisible(false);
  };

  // Exclusão
  const openConf = () => {
    setConfirmarExc(true);
  };

  const closeConf = () => {
    setConfirmarExc(false);
    setExcluido(false);
  };

  const deleteRow = (id) => {
    setPost({ index: id });
    openConf();
  };

  const confirmaExcFinal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deleteRow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: post.index }),
      });
      if (res.ok) {
        setLoading(false);
        setExcluido(true);
        window.location.reload();
      } else {
        console.error('Erro ao excluir a movimentação.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setLoading(false);
    }
  };

  const changeStatus = async (tipo, descritivo, valor, data, mes, detalhes, conta, index, id) => {
    let ident = 'status' + index;
    let statusMov = document.getElementById(ident).value;
    const postData = {
      situacao: statusMov,
      index: id,
    };
    const res = await fetch('/api/updateStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });
    if (!res.ok) {
      console.error('Erro ao atualizar o status na planilha.');
    } else {
      window.location.reload();
    }
  };

  // Atualiza totais de RECEITA e DESPESA (opcional)
  useEffect(() => {
    let rec = 0;
    let pag = 0;
    if (movimentacao.length !== 0) {
      for (let i = 0; i < movimentacao.length; i++) {
        if (movimentacao[i].tipo === 'RECEITA') {
          rec += parseFloat(movimentacao[i].valor.toString().replace(',', '.'));
        }
        if (movimentacao[i].tipo === 'DESPESA') {
          pag += parseFloat(movimentacao[i].valor.toString().replace(',', '.'));
        }
      }
      setReceber(rec);
      setPagar(pag);
    }
  });

  const changeData = async () => {
    let ano = document.getElementById('ano').value;
    setFilterAno(ano);
    let mes = document.getElementById('mes').value;
    switch (mes) {
      case "Janeiro":
        mes = '01';
        break;
      case "Fevereiro":
        mes = '02';
        break;
      case "Março":
        mes = '03';
        break;
      case "Abril":
        mes = '04';
        break;
      case "Maio":
        mes = '05';
        break;
      case "Junho":
        mes = '06';
        break;
      case "Julho":
        mes = '07';
        break;
      case "Agosto":
        mes = '08';
        break;
      case "Setembro":
        mes = '09';
        break;
      case "Outubro":
        mes = '10';
        break;
      case "Novembro":
        mes = '11';
        break;
      case "Dezembro":
        mes = '12';
        break;
    }
    setFilterMes(mes);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <title>A pagar/A receber - CF</title>
      <div className="p-4">
        {/* Filtros de Ano e Mês */}
        <div className="w-full flex md:justify-end h-10">
          <div className="w-[100%] md:w-[30%] md:justify-end gap-[10%] md:gap-3 flex">
            <select
              id="ano"
              key="ano"
              className="w-[30%] md:w-20 h-full bg-blue-800 p-1 rounded-lg hover:bg-blue-400 text-blue-200 font-semibold outline-none hover:cursor-pointer text-lg"
              onChange={changeData}
              defaultValue={filterAno || new Date().getFullYear()}
            >
              {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => {
                const y = 2023 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <select
              id="mes"
              key="mes"
              className="w-[60%] md:w-32 h-full bg-blue-200 p-1 rounded-lg hover:bg-blue-400 text-blue-800 outline-none font-semibold hover:cursor-pointer text-lg"
              onChange={changeData}
              defaultValue={monthName(filterMes || new Date().toISOString().slice(5,7))}
            >
              <option value="Janeiro">Janeiro</option>
              <option value="Fevereiro">Fevereiro</option>
              <option value="Março">Março</option>
              <option value="Abril">Abril</option>
              <option value="Maio">Maio</option>
              <option value="Junho">Junho</option>
              <option value="Julho">Julho</option>
              <option value="Agosto">Agosto</option>
              <option value="Setembro">Setembro</option>
              <option value="Outubro">Outubro</option>
              <option value="Novembro">Novembro</option>
              <option value="Dezembro">Dezembro</option>
            </select>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div className="my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-3 items-center justify-between font-bold">
          <span>Movimentação</span>
          <span className="sm:text-left text-right">Status</span>
          <span className="hidden md:grid">Data</span>
          <span className="hidden sm:grid">Conta</span>
        </div>
        <ul>
          {movimentacao.slice(0).map((mov, index) => (
            <li
              key={index}
              className="bg-gray-50 rounded-lg my-3 p-2 grid md:grid-cols-4 w-full sm:w-full sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer"
            >
              <div
                className="flex"
                onClick={() =>
                  handler(
                    mov.tipo,
                    mov.descritivo, // assume que aqui o "descritivo" é a categoria
                    mov.valor,
                    mov.data,
                    mov.mes,
                    mov.detalhes,
                    mov.situacao,
                    mov.conta
                  )
                }
              >
                <div
                  className={
                    mov.tipo.toUpperCase() === 'RECEITA'
                      ? 'bg-green-200 rounded-lg p-3 h-[50%] my-auto'
                      : 'bg-red-200 rounded-lg p-3 h-[50%] my-auto'
                  }
                >
                  {getIconForMovimentacao(mov, categoriesMapping)}
                </div>
                <div className="pl-2 w-32">
                  <p className="text-gray-800 font-bold text-xs">
                    R$ {parseFloat(mov.valor).toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-gray-800 text-xs lg:hidden">
                    {mov.detalhes.length >= 15
                      ? mov.detalhes.slice(0, 13) + '...'
                      : mov.detalhes}
                  </p>
                  <p className="text-gray-800 text-sm hidden lg:block">
                    {mov.detalhes}
                  </p>
                  <p className="text-gray-500 text-xs">{mov.conta}</p>
                </div>
              </div>
              <div className="flex text-gray-600 sm:text-left text-left justify-between">
                <select
                  id={'status' + index}
                  key={index}
                  className={
                    mov.situacao === 'Recebido' || mov.situacao === 'A receber'
                      ? 'bg-green-200 p-1 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer'
                      : 'bg-red-200 p-1 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer'
                  }
                  onChange={() => changeStatus(mov.tipo, mov.descritivo, mov.valor, mov.data, mov.mes, mov.detalhes, mov.conta, index, mov.id)}
                >
                  <option value={mov.situacao}>{mov.situacao}</option>
                  <option
                    value={
                      mov.situacao === 'Recebido'
                        ? 'A receber'
                        : mov.situacao === 'A receber'
                        ? 'Recebido'
                        : mov.situacao === 'Pago'
                        ? 'A pagar'
                        : 'Pago'
                    }
                  >
                    {mov.situacao === 'Recebido'
                      ? 'A receber'
                      : mov.situacao === 'A receber'
                      ? 'Recebido'
                      : mov.situacao === 'Pago'
                      ? 'A pagar'
                      : 'Pago'}
                  </option>
                </select>
                <div
                  onClick={() => deleteRow(mov.id)}
                  className="sm:hidden bg-red-400 rounded-lg p-3 w-12 flex justify-center cursor-pointer hover:bg-red-950"
                >
                  <RiDeleteBin2Fill className="text-black" size={20} />
                </div>
              </div>
              <p className="hidden md:flex">{mov.data}</p>
              <div className="flex justify-between items-center">
                <p className="sm:flex hidden">{mov.conta}</p>
                <div
                  onClick={() => deleteRow(mov.id)}
                  className="bg-red-400 rounded-lg p-3 w-12 hidden sm:flex justify-center cursor-pointer hover:bg-red-950"
                >
                  <RiDeleteBin2Fill className="text-black" size={20} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de Detalhes */}
      <Modal closeButton aria-labelledby="modal-title" open={visible} onClose={closeHandler}>
        <Modal.Header>
          <Text id="modal-title" size={18}>
            <Text b size={18}>
              Movimentação: {tipo}
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Categoria:</Text> {descritivo}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Valor:</Text> {valor}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Data:</Text> {data}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Mês/Fatura:</Text> {mes}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Detalhes:</Text> {detalhes}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Situação:</Text> {situacao}
            </Text>
          </div>
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              <Text b size={18}>Conta:</Text> {conta}
            </Text>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal closeButton aria-labelledby="modal-title" open={confirmarExc} onClose={() => { setConfirmarExc(false); setExcluido(false); }}>
        <Modal.Header>
          <Text id="modal-title" size={18}>
            <Text b size={18}>
              {excluido ? 'Feito!' : loading ? 'Excluindo...' : 'Tem certeza?'}
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
            <Text>
              {excluido
                ? 'Movimentação excluída com sucesso!'
                : loading
                ? 'Por favor, aguarde...'
                : 'Deseja excluir a movimentação do histórico? Isso afetará todos os valores que utilizavam essa informação!'}
            </Text>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="success" onPress={excluido ? () => { setConfirmarExc(false); setExcluido(false); } : confirmaExcFinal}>
            {excluido ? <AiFillCheckCircle size={20} /> : loading ? <Loading type="spinner" color="white" size="sm" /> : 'Ok!'}
          </Button>
          <Button auto flat color="error" onPress={() => { setConfirmarExc(false); setExcluido(false); }}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Apagar;
