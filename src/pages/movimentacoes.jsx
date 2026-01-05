import React, { useState, useEffect } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { Modal, Button, Text, Loading } from '@nextui-org/react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useFormOptionsContext } from '@/contexts/FormOptionsContext';

// Função que retorna o ícone da categoria
function getIconForMovimentacao(mov, categoryIconMapping = {}) {
  const { Icon, color } = getCategoryIcon(mov.descritivo, mov.tipo, categoryIconMapping);
  const bgClass = mov.tipo?.toUpperCase() === 'RECEITA' ? 'bg-green-200' : 'bg-red-200';
  
  return {
    icon: <Icon size={20} style={{ color }} />,
    bgClass
  };
}

const movimentacoes = () => {
  // Busca o mapeamento de ícones do Context
  const { categoryIconMapping } = useFormOptionsContext();
  
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

  // Função para carregar movimentações da nova API
  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/movimentacoes?situacao=Pago,Recebido');
      const result = await response.json();
      
      if (result.success) {
        setMovimentacao(result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
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
      const response = await fetch('/api/deleteRow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex,
          sheetName: 'Extrato'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setExcluido(true);
        
        // Recarrega as movimentações após exclusão
        await fetchMovimentacoes();
        
        setTimeout(() => {
          setConfirmarExc(false);
          setExcluido(false);
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      alert('Erro ao excluir movimentação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (mov, novoStatus) => {
    try {
      setLoading(true);

      const response = await fetch('/api/updateStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: mov.rowIndex,
          novoStatus,
          sheetName: 'Extrato'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Recarrega as movimentações após atualização
        await fetchMovimentacoes();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setLoading(false);
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
              .map((mov, index) => {
                const { icon, bgClass } = getIconForMovimentacao(mov, categoryIconMapping);
                
                return (
                  <li
                    key={mov.rowIndex || index}
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
                          mov.mês,
                          mov.detalhes,
                          mov.situação,
                          mov.conta,
                          mov.rowIndex
                        )
                      }
                    >
                      <div className={`${bgClass} rounded-lg p-3`}>
                        {icon}
                      </div>
                      <div className="pl-2 w-32">
                        <p className="text-gray-800 font-bold text-xs">
                          {mov.valor}
                        </p>
                        <p className="text-gray-800 text-sm lg:hidden">
                          {mov.detalhes?.length >= 15
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
                      className={
                        mov.situação === 'Recebido' || mov.situação === 'A receber'
                          ? 'bg-green-200 p-1 rounded-lg text-green-800 font-semibold cursor-pointer border-none outline-none'
                          : 'bg-red-200 p-1 rounded-lg text-red-800 font-semibold cursor-pointer border-none outline-none'
                      }
                      value={mov.situação}
                      onChange={(e) => {
                        const novoStatus = e.target.value;
                        if (novoStatus !== mov.situação) {
                          changeStatus(mov, novoStatus);
                        }
                      }}
                    >
                      {mov.tipo === 'RECEITA' ? (
                        <>
                          <option value="A receber">A receber</option>
                          <option value="Recebido">Recebido</option>
                        </>
                      ) : (
                        <>
                          <option value="A pagar">A pagar</option>
                          <option value="Pago">Pago</option>
                        </>
                      )}
                    </select>
                    <div
                      onClick={() => deleteRow(mov.rowIndex)}
                      className="sm:hidden bg-red-400 rounded-lg p-3 w-12 flex justify-center cursor-pointer hover:bg-red-950"
                    >
                      <RiDeleteBin2Fill className="text-black" size={20} />
                    </div>
                  </div>
                  <p className="hidden md:flex">{mov.data}</p>
                  <div className="flex justify-between items-center">
                    <p className="sm:flex hidden">{mov.conta}</p>
                    <div
                      onClick={() => deleteRow(mov.rowIndex)}
                      className="bg-red-400 rounded-lg p-3 w-12 hidden sm:flex justify-center cursor-pointer hover:bg-red-950"
                    >
                      <RiDeleteBin2Fill className="text-black" size={20} />
                    </div>
                  </div>
                </li>
              );
            })}
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
