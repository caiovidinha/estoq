import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { AiFillCheckCircle } from 'react-icons/ai';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { Modal, Button, Text, Loading } from '@nextui-org/react';
import { getTransacoes, deleteTransacao, updateTransacao } from '@/services/api';

// Função que retorna o ícone padrão para todas as movimentações
function getIconForMovimentacao(mov) {
// Função que retorna o ícone padrão para todas as movimentações
function getIconForMovimentacao(mov) {
  const colorClass = mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <BsThreeDots size={20} className={colorClass} />;
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
  const [rowIndex, setRowIndex] = useState(null);
  const [confirmarExc, setConfirmarExc] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [loading, setLoading] = useState(false);

  const [movimentacao, setMovimentacao] = useState([]);

  // Função para carregar movimentações
  const fetchMovimentacoes = async () => {
    try {
      setLoading(true)
      const response = await getTransacoes({ page_size: 1000 }) // Busca todas as transações
      setMovimentacao(response.items || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      setLoading(false)
    }
  }

  // Carrega dados apenas na montagem inicial
  useEffect(() => {
    fetchMovimentacoes()
  }, []);

  const handler = (
    tipo,
    descritivo,
    valor,
    data,
    mes,
    detalhes,
    situacao,
    conta,
    index
  ) => {
    setTipo(tipo);
    seteDescritivo(descritivo);
    setValor(valor);
    setData(data);
    setMes(mes);
    setDetalhes(detalhes);
    setSituacao(situacao);
    setConta(conta);
    setRowIndex(index);
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

  const deleteRow = (index) => {
    setRowIndex(index);
    openConf();
  };

  const confirmaExcFinal = async () => {
    setLoading(true);
    try {
      await deleteTransacao(rowIndex)
      setLoading(false);
      setExcluido(true);
      // Recarrega as movimentações após exclusão
      const response = await getTransacoes({ page_size: 1000 })
      setMovimentacao(response.items || [])
      setTimeout(() => {
        setConfirmarExc(false)
        setExcluido(false)
      }, 1500)
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      setLoading(false);
    }
  };

  const changeStatus = async (mov) => {
    try {
      setLoading(true)
      // Alterna o status
      const novoStatus = mov.situacao === 'Pago' 
        ? 'A pagar' 
        : mov.situacao === 'A pagar'
        ? 'Pago'
        : mov.situacao === 'Recebido'
        ? 'A receber'
        : 'Recebido'

      await updateTransacao(mov.row_index, { situacao: novoStatus })
      
      // Atualiza lista local
      const response = await getTransacoes({ page_size: 1000 })
      setMovimentacao(response.items || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setLoading(false)
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
                  key={mov.row_index}
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
                        mov.conta,
                        mov.row_index
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
                      {getIconForMovimentacao(mov)}
                    </div>
                    <div className="pl-2 w-32">
                      <p className="text-gray-800 font-bold text-xs">
                        {mov.valor}
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
                    <button
                      className={
                        mov.situacao === 'Recebido' || mov.situacao === 'A receber'
                          ? 'bg-green-200 p-1 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer'
                          : 'bg-red-200 p-1 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer'
                      }
                      onClick={() => changeStatus(mov)}
                    >
                      {mov.situacao}
                    </button>
                    <div
                      onClick={() => deleteRow(mov.row_index)}
                      className="sm:hidden bg-red-400 rounded-lg p-3 w-12 flex justify-center cursor-pointer hover:bg-red-950"
                    >
                      <RiDeleteBin2Fill className="text-black" size={20} />
                    </div>
                  </div>
                  <p className="hidden md:flex">{mov.data}</p>
                  <div className="flex justify-between items-center">
                    <p className="sm:flex hidden">{mov.conta}</p>
                    <div
                      onClick={() => deleteRow(mov.row_index)}
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
