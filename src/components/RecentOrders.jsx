import React, { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { getTransacoes } from '@/services/api';

// Função para retornar o ícone padrão para todas as movimentações
function getIconForMovimentacao(mov) {
  const colorClass = mov.tipo.toUpperCase() === 'RECEITA' ? 'text-green-800' : 'text-red-800';
  return <BsThreeDots size={20} className={colorClass} />;
}

const RecentOrders = () => {
  const [mov, setMov] = useState([]);

  // Carrega as movimentações da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca transações Pagas e Recebidas separadamente
        const [responsePaga, responseRecebida] = await Promise.all([
          getTransacoes({ 
            page_size: 50,
            situacao: 'Paga',
            order_by: 'data'
          }),
          getTransacoes({ 
            page_size: 50,
            situacao: 'Recebida',
            order_by: 'data'
          })
        ])

        // Junta as duas listas
        const todasTransacoes = [
          ...(responsePaga.items || []),
          ...(responseRecebida.items || [])
        ]

        // Ordena por data (mais recente primeiro) e pega apenas as 20 primeiras
        const transacoesOrdenadas = todasTransacoes
          .sort((a, b) => {
            // Converte DD/MM/YYYY para Date para comparar
            const [diaA, mesA, anoA] = a.data.split('/')
            const [diaB, mesB, anoB] = b.data.split('/')
            const dataA = new Date(anoA, mesA - 1, diaA)
            const dataB = new Date(anoB, mesB - 1, diaB)
            return dataB - dataA // Ordem decrescente (mais recente primeiro)
          })
          .slice(0, 20)

        setMov(transacoesOrdenadas)
      } catch (err) {
        console.error('Erro ao carregar movimentações:', err)
      }
    }
    fetchData()
  }, []);

  return (
    <div className="w-full col-span-3 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      <ul>
        {mov.map((mov, id) => (
            <li
              key={mov.row_index}
              className="bg-gray-50 rounded-lg my-3 p-2 flex items-center cursor-pointer"
            >
              <div className="flex items-center">
                <div
                  className={
                    mov.tipo.toUpperCase() === 'RECEITA'
                      ? 'bg-green-200 rounded-lg p-3'
                      : 'bg-red-200 rounded-lg p-3'
                  }
                >
                  {getIconForMovimentacao(mov)}
                </div>
                <div className="pl-4">
                  <p className="text-gray-800 font-extrabold">
                    {mov.valor}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {mov.detalhes ? `${mov.detalhes} - ` : ''}{mov.conta}{mov.cartao ? ` - ${mov.cartao}` : ''}
                  </p>
                </div>
              </div>
              <p className="lg:flex md:hidden absolute mb-7 right-6 text-sm">
                {mov.data}
              </p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RecentOrders;
