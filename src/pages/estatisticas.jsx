import React, { useState, useEffect } from 'react';
import { AiOutlineLineChart } from 'react-icons/ai';
import { Loading } from '@nextui-org/react';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useFormOptionsContext } from '@/contexts/FormOptionsContext';

const Estatisticas = () => {
  const { categoryIconMapping } = useFormOptionsContext();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [agrupar, setAgrupar] = useState('geral');
  const [dados, setDados] = useState(null);

  // Buscar estatísticas
  const fetchEstatisticas = async () => {
    try {
      setLoading(true);
      let url = `/api/estatisticas?periodo=${periodo}&agrupar=${agrupar}`;
      
      if (periodo === 'personalizado') {
        url += `&dataInicio=${dataInicio}&dataFim=${dataFim}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDados(result);
      } else {
        console.error('Erro ao buscar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar e ao mudar filtros
  useEffect(() => {
    if (periodo !== 'personalizado' || (dataInicio && dataFim)) {
      fetchEstatisticas();
    }
  }, [periodo, agrupar]);

  // Handler para buscar com período personalizado
  const handleCustomPeriodSearch = () => {
    if (dataInicio && dataFim) {
      fetchEstatisticas();
    }
  };

  // Formatar valor em reais
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Converter data para formato brasileiro
  const formatDateToBr = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  // Converter data do input (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
  const convertInputDateToBr = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <main className="bg-gray-100 min-h-screen p-4">
      <title>Estatísticas - CF</title>

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-800 text-white p-3 rounded-lg">
          <AiOutlineLineChart size={30} />
        </div>
        <h1 className="text-3xl font-bold">Estatísticas Financeiras</h1>
      </div>

      {/* Filtros - Em uma linha no desktop */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="ano">Este Ano</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Data Início (apenas para personalizado) */}
          {periodo === 'personalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio.split('/').reverse().join('-')}
                onChange={(e) => setDataInicio(convertInputDateToBr(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Data Fim (apenas para personalizado) */}
          {periodo === 'personalizado' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim.split('/').reverse().join('-')}
                onChange={(e) => setDataFim(convertInputDateToBr(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Visualização */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visualização
            </label>
            <select
              value={agrupar}
              onChange={(e) => setAgrupar(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="geral">Visão Geral</option>
              <option value="categoria">Por Categoria</option>
            </select>
          </div>

          {/* Botão buscar (apenas para personalizado) */}
          {periodo === 'personalizado' && (
            <div>
              <button
                onClick={handleCustomPeriodSearch}
                className="w-full bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-900 transition-colors"
              >
                Buscar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loading size="xl" color="secondary" />
        </div>
      )}

      {/* Conteúdo */}
      {!loading && dados && (
        <>
          {/* Cards de Totais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Receitas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Receitas (Período)</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(dados.totais.receitas)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {dados.transacoes} transações no período
              </p>
            </div>

            {/* Total Despesas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Despesas (Período)</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(dados.totais.despesas)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Últimos {dados.periodo.dias} dias
              </p>
            </div>

            {/* Saldo */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Saldo (Período)</h3>
              <p className={`text-2xl font-bold ${dados.totais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dados.totais.saldo)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {dados.totais.saldo >= 0 ? 'Positivo' : 'Negativo'}
              </p>
            </div>
          </div>

          {/* Cards de Totais Gerais */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Totais Gerais (Histórico Completo)</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Receitas</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(dados.totaisGerais.receitas)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Despesas</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(dados.totaisGerais.despesas)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo Geral</p>
                <p className={`text-xl font-bold ${dados.totaisGerais.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dados.totaisGerais.saldo)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Período Analisado</p>
                <p className="text-xl font-bold text-purple-600">{dados.totaisGerais.diasAnalisados} dias</p>
              </div>
            </div>
          </div>

          {/* Cards de Médias */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Médias</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Média Semanal */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Média Semanal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(dados.medias.semanal.receitas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(dados.medias.semanal.despesas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Saldo:</span>
                    <span className={`font-bold ${dados.medias.semanal.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dados.medias.semanal.saldo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Média Mensal */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Média Mensal</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(dados.medias.mensal.receitas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(dados.medias.mensal.despesas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Saldo:</span>
                    <span className={`font-bold ${dados.medias.mensal.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dados.medias.mensal.saldo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Média Diária */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-800">Média Diária</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Receitas:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(dados.medias.diaria.receitas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Despesas:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(dados.medias.diaria.despesas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Saldo:</span>
                    <span className={`font-bold ${dados.medias.diaria.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dados.medias.diaria.saldo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visão por Categoria */}
          {agrupar === 'categoria' && dados.categorias && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Detalhamento por Categoria</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4">Categoria</th>
                      <th className="text-right py-3 px-4">Receitas</th>
                      <th className="text-right py-3 px-4">Despesas</th>
                      <th className="text-right py-3 px-4">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.categorias.map((cat, index) => {
                      const { Icon, color } = getCategoryIcon(
                        cat.nome,
                        cat.receitas > cat.despesas ? 'RECEITA' : 'DESPESA',
                        categoryIconMapping
                      );
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${cat.receitas > cat.despesas ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Icon size={20} style={{ color }} />
                              </div>
                              <span className="font-medium">{cat.nome}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-green-600 font-medium">
                            {formatCurrency(cat.receitas)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600 font-medium">
                            {formatCurrency(cat.despesas)}
                          </td>
                          <td className={`text-right py-3 px-4 font-bold ${cat.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(cat.total)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mensagem quando não há dados */}
      {!loading && !dados && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">Selecione um período para visualizar as estatísticas</p>
        </div>
      )}
    </main>
  );
};

export default Estatisticas;
