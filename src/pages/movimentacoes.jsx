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

// Objeto que mapeia a string do ícone para o componente real
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

// Função que, dado uma movimentação e o array de categorias carregadas, retorna o ícone apropriado
function getIconForMovimentacao(mov, categoriesMapping) {
  // Procura na lista de categorias (pela propriedade "nome") a categoria correspondente ao mov.descritivo
  const catFound = categoriesMapping.find(cat => cat.nome === mov.descritivo);
  const iconName = catFound ? catFound.icone : 'BsThreeDots';
  const IconComponent = IconComponents[iconName] || BsThreeDots;
  // Define a cor: receitas em verde, despesas em vermelho
  const colorClass = mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <IconComponent size={20} className={colorClass} />;
}

const movimentacoes = () => {
  // Estados de modal e movimentações
  const [visible, setVisible] = useState(false);
  const [tipo, setTipo] = useState('');
  const [descritivo, seteDescritivo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [mes, setMes] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [situacao, setSituacao] = useState('');
  const [conta, setConta] = useState('');
  const [post, setPost] = useState({});
  const [exc, setExc] = useState(false);
  const [confirmarExc, setConfirmarExc] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [loading, setLoading] = useState(false);

  const [movimentacao, setMovimentacao] = useState([]);
  const [categoriesMapping, setCategoriesMapping] = useState([]);

  // IDs e ranges
  const SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE';
  const SHEET_TITLE_MOV = 'Extrato';
  const SHEET_RANGE = 'A:H';
  const FULL_URL_MOV =
    'https://docs.google.com/spreadsheets/d/' +
    SHEET_ID +
    '/gviz/tq?sheet=' +
    SHEET_TITLE_MOV +
    '&range=' +
    SHEET_RANGE;
  // URL da aba de categorias (dinâmicas)
  const FULL_URL_CATEGORIAS =
    'https://docs.google.com/spreadsheets/d/' +
    SHEET_ID +
    '/gviz/tq?sheet=Categories&range=A2:C';

  // Função para buscar categorias (dinâmico)
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
        catList.push({ nome, tipo, icone });
      }
      return catList;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      return [];
    }
  };

  // Busca as movimentações do extrato
  useEffect(() => {
    fetch(FULL_URL_MOV)
      .then((res) => res.text())
      .then((rep) => {
        let data = JSON.parse(rep.substr(47).slice(0, -2));
        let produto = new Mov();
        for (let i = 0; i < data.table.rows.length; i++) {
          produto.salvar(
            i + 3,
            data.table.rows[i].c[0].v, // tipo
            data.table.rows[i].c[1].v, // descritivo
            data.table.rows[i].c[2].v.toFixed(2), // valor
            data.table.rows[i].c[3].v, // data
            data.table.rows[i].c[4].v, // mes
            data.table.rows[i].c[5].v, // detalhes
            data.table.rows[i].c[6].v, // situacao
            data.table.rows[i].c[7].v  // conta
          );
        }
        setMovimentacao(produto.arrayMov);
      });
  }, []);

  // Busca a lista de categorias para mapeamento dinâmico
  useEffect(() => {
    fetchCategorias().then((cats) => setCategoriesMapping(cats));
  }, []);

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

  const changeStatus = async (index, id) => {
    let ident = 'status' + index;
    let statusMov = document.getElementById(ident).value;
    const post = {
      situacao: statusMov,
      index: id,
    };
    const res = await fetch('/api/updateStatus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) {
      console.error('Erro ao atualizar o status na planilha.');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <title>Movimentações - CF</title>
      <div className="p-4">
        <div className="w-full m-auto p-4 border rounded-lg overflow-y-auto">
          <div className="my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-3 items-center justify-between font-bold">
            <span>Movimentação</span>
            <span className="sm:text-left text-right">Status</span>
            <span className="hidden md:grid">Data</span>
            <span className="hidden sm:grid">Conta</span>
          </div>
          <ul>
            {movimentacao
              .slice(0)
              .reverse()
              .map((mov, index) => (
                <li
                  key={mov.id}
                  className="bg-gray-50 rounded-lg my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer"
                >
                  <div
                    className="flex"
                    onClick={() =>
                      handler(
                        mov.tipo,
                        mov.descritivo,
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
                          ? 'bg-green-200 rounded-lg p-3'
                          : 'bg-red-200 rounded-lg p-3'
                      }
                    >
                      {getIconForMovimentacao(mov, categoriesMapping)}
                    </div>
                    <div className="pl-2 w-32">
                      <p className="text-gray-800 font-bold text-xs">
                        R$ {parseFloat(mov.valor).toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-gray-800 text-sm lg:hidden">
                        {mov.detalhes.length >= 15
                          ? mov.detalhes.slice(0, 13) + '...'
                          : mov.detalhes}
                      </p>
                      <p className="text-gray-800 text-sm hidden lg:block">
                        {mov.detalhes}
                      </p>
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
                      onChange={() => changeStatus(index, mov.id)}
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
      </div>

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
              {excluido ? 'Movimentação excluída com sucesso!' : loading ? 'Por favor, aguarde...' : 'Deseja excluir a movimentação do histórico? Isso afetará todos os valores que utilizavam essa informação!'}
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

export default movimentacoes;
