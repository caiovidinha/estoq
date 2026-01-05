import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';

// Função para retornar o ícone padrão para todas as movimentações
function getIconForMovimentacao(mov) {
  const colorClass = mov.tipo?.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <BsThreeDots size={20} className={colorClass} />;
}

const RecentOrders = () => {
  const [mov, setMov] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega as 20 movimentações mais recentes (Paga/Recebida)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/movimentacoes?situacao=Pago,Recebido&limit=20');
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
    fetchData();
  }, []);

  return (
    <div className="w-full col-span-3 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
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
          {mov.map((movItem, id) => (
            <li
              key={movItem.rowIndex || id}
              className="bg-gray-50 rounded-lg my-3 p-2 flex items-center cursor-pointer"
            >
              <div className="flex items-center">
                <div
                  className={
                    movItem.tipo?.toUpperCase() === 'RECEITA'
                      ? 'bg-green-200 rounded-lg p-3'
                      : 'bg-red-200 rounded-lg p-3'
                  }
                >
                  {getIconForMovimentacao(movItem)}
                </div>
                <div className="pl-4">
                  <p className="text-gray-800 font-extrabold">
                    {movItem.valor}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {movItem.detalhes ? `${movItem.detalhes} - ` : ''}{movItem.conta}
                  </p>
                </div>
              </div>
              <p className="lg:flex md:hidden absolute mb-7 right-6 text-sm">
                {movItem.data}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentOrders;
