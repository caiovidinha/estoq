import React, { useState, useEffect } from 'react';
import InvestimentoTabs from '@/components/investimentos/InvestimentoTabs';
import CarteiraPieChart from '@/components/investimentos/CarteiraPieChart';
import InvestimentoChat from '@/components/investimentos/InvestimentoChat';
import { HiRefresh, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { BsGraphUp } from 'react-icons/bs';

const fmt = (v) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v) => {
  const n = v || 0;
  return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
};

const GainBadge = ({ value, pct }) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
        ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
    >
      {positive ? <HiTrendingUp size={12} /> : <HiTrendingDown size={12} />}
      {fmt(value)} ({fmtPct(pct)})
    </span>
  );
};

export default function InvestimentosDashboard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDados = async () => {
    try {
      const res = await fetch('/api/investimentos/patrimonio');
      const json = await res.json();
      if (json.success) {
        setDados(json);
        setError(null);
      } else {
        setError(json.error || 'Erro ao carregar dados');
      }
    } catch {
      setError('Erro ao carregar dados de patrimônio');
    }
  };

  useEffect(() => {
    fetchDados().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDados();
    setRefreshing(false);
  };

  const top5 = dados?.ativos?.slice(0, 5) || [];
  const patrimonioTotal = dados?.patrimonioTotal || 0;

  return (
    <main className="bg-gray-100 min-h-screen pb-8">
      <title>Investimentos - CF</title>

      {/* Page header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <BsGraphUp size={22} className="text-purple-700" />
          <h1 className="text-xl font-bold text-gray-800">Investimentos</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Atualizar cotações"
        >
          <HiRefresh size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <InvestimentoTabs />

      {loading && (
        <div className="flex justify-center items-center py-20 text-gray-400">
          Carregando...
        </div>
      )}

      {error && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && dados && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4 mb-4">
            {/* Patrimônio Total */}
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-1">Patrimônio Total</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(dados.patrimonioTotal)}</p>
              <p className="text-xs text-gray-400 mt-1">Custo: {fmt(dados.custoTotalGeral)}</p>
            </div>

            {/* Variação Hoje */}
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-1">Variação Hoje</p>
              <p
                className={`text-2xl font-bold ${
                  dados.variacaoHoje >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {fmt(dados.variacaoHoje)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Ativos com cotação em tempo real</p>
            </div>

            {/* Ganho/Perda Total */}
            <div className="bg-white rounded-lg border p-4">
              <p className="text-xs text-gray-500 mb-1">Ganho / Perda Total</p>
              <p
                className={`text-2xl font-bold ${
                  dados.ganhoTotal >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {fmt(dados.ganhoTotal)}
              </p>
              <p
                className={`text-xs font-semibold mt-1 ${
                  dados.ganhoPorcentagem >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {fmtPct(dados.ganhoPorcentagem)} sobre o custo
              </p>
            </div>
          </div>

          {/* Allocation + Top positions + Chat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
            {/* Pie chart */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-bold text-gray-700 mb-4">Alocação por Tipo</h2>
              <CarteiraPieChart
                patrimonioPorTipo={dados.patrimonioPorTipo}
                total={dados.patrimonioTotal}
              />
              {/* Legend with values */}
              <div className="mt-4 space-y-2">
                {Object.entries(dados.patrimonioPorTipo).map(([tipo, valor]) => (
                  <div key={tipo} className="flex justify-between text-sm">
                    <span className="text-gray-600">{tipo}</span>
                    <span className="font-semibold">
                      {fmt(valor)}{' '}
                      <span className="text-gray-400 font-normal">
                        ({patrimonioTotal > 0 ? ((valor / patrimonioTotal) * 100).toFixed(1) : 0}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 positions */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-bold text-gray-700 mb-4">Maiores Posições</h2>
              {top5.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Nenhum ativo encontrado na aba &quot;Carteira&quot; do Google Sheets.
                </p>
              ) : (
                <div className="space-y-3">
                  {top5.map((ativo) => (
                    <div key={ativo.ticker} className="flex items-center gap-3">
                      {ativo.logo ? (
                        <img
                          src={ativo.logo}
                          alt={ativo.ticker}
                          className="w-8 h-8 rounded-full object-contain bg-gray-100"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                          {ativo.ticker?.slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{ativo.ticker}</p>
                        <p className="text-xs text-gray-400 truncate">{ativo.nome}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{fmt(ativo.valorAtual)}</p>
                        <GainBadge value={ativo.ganho} pct={ativo.ganhoPercent} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Chat */}
          <div className="px-4 mt-4">
            <InvestimentoChat />
          </div>

          {/* All assets table */}
          {dados.ativos.length > 5 && (
            <div className="px-4 mt-4">
              <div className="bg-white rounded-lg border p-4">
                <h2 className="font-bold text-gray-700 mb-4">Todos os Ativos</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="pb-2 font-medium">Ativo</th>
                        <th className="pb-2 font-medium text-right">Qtd</th>
                        <th className="pb-2 font-medium text-right">P. Médio</th>
                        <th className="pb-2 font-medium text-right">Cotação</th>
                        <th className="pb-2 font-medium text-right">Valor</th>
                        <th className="pb-2 font-medium text-right">Ganho</th>
                        <th className="pb-2 font-medium text-right">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.ativos.map((a) => (
                        <tr key={a.ticker} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2">
                            <span className="font-semibold">{a.ticker}</span>
                            <span className="text-gray-400 text-xs ml-2">{a.tipo}</span>
                          </td>
                          <td className="py-2 text-right text-gray-600">{a.quantidade}</td>
                          <td className="py-2 text-right text-gray-600">{fmt(a.preco_medio)}</td>
                          <td className="py-2 text-right">
                            {a.temCotacao ? fmt(a.precoAtual) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="py-2 text-right font-semibold">{fmt(a.valorAtual)}</td>
                          <td className={`py-2 text-right text-xs font-semibold ${a.ganho >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmtPct(a.ganhoPercent)}
                          </td>
                          <td className="py-2 text-right text-gray-500">{a.pesoCarteira.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
