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

const Apagar = () => {
  // Busca o mapeamento de ícones do Context
  const { categoryIconMapping } = useFormOptionsContext();
  
  // Estados de filtros e modais
  const [filterMes, setFilterMes] = useState('');
  const [filterAno, setFilterAno] = useState('');
  const [update, setUpdate] = useState(false);
  const [movimentacao, setMovimentacao] = useState([]);
  const [tipoConta, setTipoConta] = useState('todos'); // 'debito', 'credito', 'todos'
  const [tipoContaAtual, setTipoContaAtual] = useState(''); // Para saber qual sheet usar
  
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
      
      // Busca movimentações pendentes (A pagar ou A receber) com filtro de tipo de conta
      const response = await fetch(`/api/movimentacoes?situacao=A pagar,A receber&tipoConta=${tipoConta}`);
      const result = await response.json();
      
      if (result.success) {
        const todasTransacoes = result.data;
        
        // Filtra por mês/ano
        const filtered = todasTransacoes.filter(mov => {
          // Extrai mês e ano da data (formato: dd/mm/yyyy)
          const [dia, mes, ano] = mov.data.split('/');
          const mesData = mes.padStart(2, '0');
          const anoData = ano;
          
          return mesData === filterMes && anoData === filterAno;
        });
        
        // Ordena por data crescente
        const sorted = filtered.sort((a, b) => {
          const [dayA, monthA, yearA] = a.data.split('/');
          const [dayB, monthB, yearB] = b.data.split('/');
          return new Date(+yearA, +monthA - 1, +dayA) - new Date(+yearB, +monthB - 1, +dayB);
        });
        
        setMovimentacao(sorted);
        
        // Calcula totais
        let totalReceber = 0;
        let totalPagar = 0;
        
        sorted.forEach(mov => {
          const valorNum = parseFloat(mov.valor.replace('R$', '').replace('.', '').replace(',', '.'));
          
          if (mov.situação === 'A receber') {
            totalReceber += valorNum;
          } else if (mov.situação === 'A pagar') {
            totalPagar += Math.abs(valorNum);
          }
        });
        
        setReceber(totalReceber);
        setPagar(totalPagar);
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  }

  // Carrega as movimentações quando mês/ano ou tipoConta mudam
  useEffect(() => {
    if (filterMes && filterAno) {
      fetchMovimentacoes()
    }
  }, [filterMes, filterAno, tipoConta]);

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
    index,
    tipoContaMov
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
    setTipoContaAtual(tipoContaMov);
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

  const deleteRow = (index, tipoContaMov) => {
    setRowIndex(index);
    setTipoContaAtual(tipoContaMov);
    openConf();
  };

  const confirmaExcFinal = async () => {
    setLoading(true);
    try {
      const sheetName = tipoContaAtual === 'Crédito' ? 'Extrato Crédito' : 'Extrato';
      
      const response = await fetch('/api/deleteRow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex,
          sheetName
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
      
      const sheetName = mov.tipoConta === 'Crédito' ? 'Extrato Crédito' : 'Extrato';

      const response = await fetch('/api/updateStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowIndex: mov.rowIndex,
          novoStatus,
          sheetName
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
        <div className="w-full flex md:justify-end h-10 mb-3">
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

        {/* Filtro de Tipo de Conta */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipoConta('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tipoConta === 'todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setTipoConta('debito')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tipoConta === 'debito'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Débito
          </button>
          <button
            onClick={() => setTipoConta('credito')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tipoConta === 'credito'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Crédito
          </button>
        </div>

        {/* Lista de Movimentações */}
        <div className="my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-3 items-center justify-between font-bold">
          <span>Movimentação</span>
          <span className="sm:text-left text-right">Status</span>
          <span className="hidden md:grid">Data</span>
          <span className="hidden sm:grid">Conta</span>
        </div>
        <ul>
          {movimentacao.slice(0).map((mov, index) => {
            const { icon, bgClass } = getIconForMovimentacao(mov, categoryIconMapping);
            // Cria uma key única combinando tipoConta e rowIndex
            const uniqueKey = `${mov.tipoConta || 'debito'}-${mov.rowIndex || index}`;
            
            return (
              <li
                key={uniqueKey}
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
                      mov.situação,
                      mov.conta,
                      mov.rowIndex,
                      mov.tipoConta
                    )
                  }
                >
                  <div className={`${bgClass} rounded-lg p-3 flex items-center justify-center`}>
                    {icon}
                  </div>
                  <div className="pl-2 w-32">
                    <p className="text-gray-800 font-bold text-xs">
                      {mov.valor}
                    </p>
                    <p className="text-gray-800 text-xs">
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
                  onClick={() => deleteRow(mov.rowIndex, mov.tipoConta)}
                  className="sm:hidden bg-red-400 rounded-lg p-3 w-12 flex justify-center cursor-pointer hover:bg-red-950"
                >
                  <RiDeleteBin2Fill className="text-black" size={20} />
                </div>
              </div>
              <p className="hidden md:flex">{mov.data}</p>
              <div className="flex justify-between items-center">
                <p className="sm:flex hidden">{mov.conta}</p>
                <div
                  onClick={() => deleteRow(mov.rowIndex, mov.tipoConta)}
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
          {tipoContaAtual && (
            <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
              <Text>
                <Text b size={18}>Tipo de Conta:</Text> {tipoContaAtual}
              </Text>
            </div>
          )}
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
