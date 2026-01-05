import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { AiFillCheckCircle } from 'react-icons/ai';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { Modal, Button, Text, Loading } from '@nextui-org/react';
// REMOVIDO: import { getTransacoes, deleteTransacao, updateTransacao } from '@/services/api';

// Função que retorna o ícone padrão para todas as movimentações
// function getIconForMovimentacao(mov) {
// Função que retorna o ícone padrão para todas as movimentações
function getIconForMovimentacao(mov) {
  const colorClass = mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <BsThreeDots size={20} className={colorClass} />;
}

const Apagar = () => {
  // Estados de filtros e modais
  const [filterMes, setFilterMes] = useState('');
  const [filterAno, setFilterAno] = useState('');
  const [update, setUpdate] = useState(false);
  const [movimentacao, setMovimentacao] = useState([]);
  
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
  const [rowIndex, setRowIndex] = useState(null);
  
  // Estados para exclusão
  const [confirmarExc, setConfirmarExc] = useState(false);
  const [excluido, setExcluido] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Função para carregar movimentações filtradas
  const fetchMovimentacoes = async () => {
    if (!filterMes || !filterAno) return
    
    try {
      setLoading(true)
      // TODO: Implementar busca com nova API do Google Sheets
      console.warn('fetchMovimentacoes() precisa ser implementado com nova API')
      setMovimentacao([])
      setLoading(false)
      
      /* CÓDIGO ANTIGO - PRECISA SER REFATORADO
      const response = await getTransacoes({ page_size: 1000 })
      const todasTransacoes = response.items || []
      
      // Filtra por mês/ano e situação
      const filtered = todasTransacoes.filter(mov => {
        // Extrai mês e ano da data (formato: dd/mm/yyyy)
        const [dia, mes, ano] = mov.data.split('/')
        const mesData = mes.padStart(2, '0')
        const anoData = ano
        
        // Filtra apenas movimentações pendentes
        const isPendente = mov.situacao === 'A pagar' || mov.situacao === 'A receber'
        
        return mesData === filterMes && anoData === filterAno && isPendente
      })
      
      // Ordena por data crescente
      const sorted = filtered.sort((a, b) => {
        const [dayA, monthA, yearA] = a.data.split('/')
        const [dayB, monthB, yearB] = b.data.split('/')
        return new Date(+yearA, +monthA - 1, +dayA) - new Date(+yearB, +monthB - 1, +dayB)
      })
      
      setMovimentacao(sorted)
      */
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error)
      setLoading(false)
    }
  }

  // Carrega as movimentações quando mês/ano mudam
  useEffect(() => {
    if (filterMes && filterAno) {
      fetchMovimentacoes()
    }
  }, [filterMes, filterAno]);

  // Handler do modal de detalhes
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

  // Exclusão
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
      // TODO: Implementar delete com nova API do Google Sheets
      console.warn('deleteTransacao() precisa ser implementado com nova API')
      // await deleteTransacao(rowIndex)
      setLoading(false);
      setExcluido(true);
      
      // Recarrega as movimentações após exclusão
      await fetchMovimentacoes()
      
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
      
      // TODO: Implementar update com nova API do Google Sheets
      console.warn('updateTransacao() precisa ser implementado com nova API')
      
      /* CÓDIGO ANTIGO
      // Alterna o status
      const novoStatus = mov.situacao === 'Pago' 
        ? 'A pagar' 
        : mov.situacao === 'A pagar'
        ? 'Pago'
        : mov.situacao === 'Recebido'
        ? 'A receber'
        : 'Recebido'

      await updateTransacao(mov.row_index, { situacao: novoStatus })
      
      // Recarrega lista filtrada
      const response = await getTransacoes({ page_size: 1000 })
      const todasTransacoes = response.items || []
      const filtered = todasTransacoes.filter(mov => {
        const [dia, mes, ano] = mov.data.split('/')
        const mesData = mes.padStart(2, '0')
        const anoData = ano
        const isPendente = mov.situacao === 'A pagar' || mov.situacao === 'A receber'
        return mesData === filterMes && anoData === filterAno && isPendente
      })
      setMovimentacao(filtered)
      */
      setLoading(false)
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      setLoading(false)
    }
  };

  // Atualiza totais de RECEITA e DESPESA
  useEffect(() => {
    let rec = 0;
    let pag = 0;
    if (movimentacao.length !== 0) {
      for (let i = 0; i < movimentacao.length; i++) {
        // Extrai o valor numérico do formato "R$ 1.234,56"
        const valorStr = movimentacao[i].valor
          .replace('R$', '')
          .trim()
          .replace(/\./g, '')
          .replace(',', '.')
        const valorNum = parseFloat(valorStr) || 0
        
        if (movimentacao[i].tipo === 'RECEITA') {
          rec += valorNum
        }
        if (movimentacao[i].tipo === 'DESPESA') {
          pag += valorNum
        }
      }
      setReceber(rec);
      setPagar(pag);
    }
  }, [movimentacao]);

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
              key={mov.row_index}
              className="bg-gray-50 rounded-lg my-3 p-2 grid md:grid-cols-4 w-full sm:w-full sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer"
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
                      ? 'bg-green-200 rounded-lg p-3 h-[50%] my-auto'
                      : 'bg-red-200 rounded-lg p-3 h-[50%] my-auto'
                  }
                >
                  {getIconForMovimentacao(mov)}
                </div>
                <div className="pl-2 w-32">
                  <p className="text-gray-800 font-bold text-xs">
                    {mov.valor}
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
