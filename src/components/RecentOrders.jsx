import React, { useState, useEffect } from 'react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useFormOptionsContext } from '@/contexts/FormOptionsContext';

const RecentOrders = () => {
  const [mov, setMov] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoConta, setTipoConta] = useState('todos'); // 'debito', 'credito', 'todos'
  
  // Busca o mapeamento de ícones do Context
  const { categoryIconMapping } = useFormOptionsContext();

  // Função para retornar o ícone da categoria
  function getIconForMovimentacao(movItem) {
    // A categoria pode estar em 'descritivo' (novas entradas) ou em 'tipo' (entradas legadas)
    const categoria = movItem.descritivo || movItem.tipo;
    // RECEITA/DESPESA: se 'tipo' for RECEITA/DESPESA usa direto, senão deriva pelo sinal do valor
    const tipoReal = (movItem.tipo?.toUpperCase() === 'RECEITA' || movItem.tipo?.toUpperCase() === 'DESPESA')
      ? movItem.tipo
      : (movItem.valor?.includes('-') ? 'DESPESA' : 'RECEITA');
    const { Icon, color } = getCategoryIcon(categoria, tipoReal, categoryIconMapping || {});
    const bgClass = tipoReal.toUpperCase() === 'RECEITA' ? 'bg-green-200' : 'bg-red-200';
    
    return {
      icon: <Icon size={20} style={{ color }} />,
      bgClass
    };
  }

  // Carrega as movimentações com base no filtro
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movimentacoes?situacao=Pago,Recebido&limit=20&tipoConta=${tipoConta}`);
      const result = await response.json();
      
      if (result.success) {
        setMov(result.data);
      } else {
        setError('Erro ao carregar movimentações');
      }
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setError('Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  };

  // Recarrega quando o filtro muda
  useEffect(() => {
    fetchData();
  }, [tipoConta]);

  return (
    <div className="w-full col-span-3 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      {/* Filtro de Tipo de Conta */}
      <div className="flex gap-2 mb-3 sticky -top-5 bg-white pb-2 border-b z-10 pt-4 shadow-sm">
        <button
          onClick={() => setTipoConta('todos')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
            tipoConta === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setTipoConta('debito')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
            tipoConta === 'debito'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Débito
        </button>
        <button
          onClick={() => setTipoConta('credito')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
            tipoConta === 'credito'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Crédito
        </button>
        <button
          onClick={() => setTipoConta('vr')}
          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
            tipoConta === 'vr'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          VR
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">Carregando...</p>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <ul>
          {mov.map((movItem, id) => {
            const { icon, bgClass } = getIconForMovimentacao(movItem);
            // Cria uma key única combinando tipoConta e rowIndex
            const uniqueKey = `${movItem.tipoConta || 'debito'}-${movItem.rowIndex || id}`;
            
            return (
              <li
                key={uniqueKey}
                className="bg-gray-50 rounded-lg my-3 p-2 flex items-center cursor-pointer"
              >
                <div className="flex items-center">
                  <div className={`${bgClass} rounded-lg p-3 flex items-center justify-center`}>
                    {icon}
                  </div>
                  <div className="pl-4">
                    <p className="text-gray-800 font-extrabold">
                      {movItem.valor}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {movItem.detalhes ? `${movItem.detalhes} - ` : ''}{movItem.conta}
                      {movItem.tipoConta && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                          {movItem.tipoConta}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className="lg:flex md:hidden absolute mb-7 right-6 text-sm">
                  {movItem.data}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentOrders;
