import React, { useState, useEffect } from 'react';
import InvestimentoTabs from '@/components/investimentos/InvestimentoTabs';
import { HiRefresh, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { BsGraphUp } from 'react-icons/bs';

const fmt = (v) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v) => {
  const n = v || 0;
  return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
};

const FILTER_TABS = ['Todos', 'Ações', 'FIIs', 'ETFs', 'BDRs', 'Renda Fixa', 'Cripto'];

const TIPO_MAP = {
  Ações: ['ação', 'acao'],
  FIIs: ['fii'],
  ETFs: ['etf'],
  BDRs: ['bdr'],
  'Renda Fixa': ['renda fixa', 'tesouro', 'cdb', 'lci', 'lca', 'cri', 'cra', 'debenture'],
  Cripto: ['cripto', 'criptomoeda', 'crypto'],
};

function matchesTipo(ativo, filter) {
  if (filter === 'Todos') return true;
  const tipoNorm = ativo.tipo?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const allowed = TIPO_MAP[filter] || [];
  return allowed.some((t) => tipoNorm === t || tipoNorm?.includes(t));
}

export default function CarteiraPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Todos');

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

  const ativos = dados?.ativos?.filter((a) => matchesTipo(a, filter)) || [];

  return (
    <main className="bg-gray-100 min-h-screen pb-8">
      <title>Carteira - Investimentos - CF</title>

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

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 px-4 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
              ${filter === tab
                ? 'bg-purple-800 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
        <div className="px-4">
          <div className="bg-white rounded-lg border overflow-hidden">
            {ativos.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                Nenhum ativo em &quot;{filter}&quot;
              </div>
            ) : (
              <>
                {/* Summary strip */}
                <div className="px-4 py-3 border-b bg-gray-50 flex flex-wrap gap-4 text-sm">
                  <span className="text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {fmt(ativos.reduce((s, a) => s + a.valorAtual, 0))}
                    </span>{' '}
                    nesta seleção
                  </span>
                  <span className="text-gray-500">
                    Custo:{' '}
                    <span className="font-semibold text-gray-700">
                      {fmt(ativos.reduce((s, a) => s + a.custoTotal, 0))}
                    </span>
                  </span>
                  <span>
                    {(() => {
                      const ganho = ativos.reduce((s, a) => s + a.ganho, 0);
                      const custo = ativos.reduce((s, a) => s + a.custoTotal, 0);
                      const pct = custo > 0 ? (ganho / custo) * 100 : 0;
                      const pos = ganho >= 0;
                      return (
                        <span className={pos ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {pos ? '▲' : '▼'} {fmt(Math.abs(ganho))} ({fmtPct(Math.abs(pct))})
                        </span>
                      );
                    })()}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 bg-gray-50 border-b">
                        <th className="px-4 py-3 font-medium">Ativo</th>
                        <th className="px-4 py-3 font-medium text-right">Qtd</th>
                        <th className="px-4 py-3 font-medium text-right">P. Médio</th>
                        <th className="px-4 py-3 font-medium text-right">Cotação</th>
                        <th className="px-4 py-3 font-medium text-right">Valor Atual</th>
                        <th className="px-4 py-3 font-medium text-right">Ganho</th>
                        <th className="px-4 py-3 font-medium text-right">Ganho %</th>
                        <th className="px-4 py-3 font-medium text-right">Dia %</th>
                        <th className="px-4 py-3 font-medium text-right">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ativos.map((a) => (
                        <tr key={a.ticker} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {a.logo ? (
                                <img
                                  src={a.logo}
                                  alt={a.ticker}
                                  className="w-7 h-7 rounded-full object-contain bg-gray-100"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                                  {a.ticker?.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-800">{a.ticker}</p>
                                <p className="text-xs text-gray-400">{a.tipo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{a.quantidade}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{fmt(a.preco_medio)}</td>
                          <td className="px-4 py-3 text-right">
                            {a.temCotacao
                              ? fmt(a.precoAtual)
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{fmt(a.valorAtual)}</td>
                          <td className={`px-4 py-3 text-right text-xs font-semibold ${a.ganho >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {a.ganho >= 0 ? '+' : ''}{fmt(a.ganho)}
                          </td>
                          <td className={`px-4 py-3 text-right text-xs font-semibold ${a.ganhoPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fmtPct(a.ganhoPercent)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {a.temCotacao ? (
                              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${a.variacaoDia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {a.variacaoDia >= 0
                                  ? <HiTrendingUp size={12} />
                                  : <HiTrendingDown size={12} />}
                                {fmtPct(a.variacaoDia)}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">{a.pesoCarteira.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y">
                  {ativos.map((a) => (
                    <div key={a.ticker} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {a.logo ? (
                            <img
                              src={a.logo}
                              alt={a.ticker}
                              className="w-8 h-8 rounded-full object-contain bg-gray-100 shrink-0"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
                              {a.ticker?.slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm leading-tight">{a.ticker}</p>
                            <p className="text-xs text-gray-400 truncate">{a.tipo} · {a.pesoCarteira.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-800 text-sm">
                            {a.temCotacao ? fmt(a.precoAtual) : <span className="text-gray-400">—</span>}
                          </p>
                          {a.temCotacao && (
                            <span className={`text-xs font-semibold ${a.variacaoDia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {fmtPct(a.variacaoDia)} hoje
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <p className="text-xs text-gray-500">
                            {a.quantidade} un · PM {fmt(a.preco_medio)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">{fmt(a.valorAtual)}</p>
                          <p className={`text-xs font-semibold ${a.ganhoPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {a.ganho >= 0 ? '+' : ''}{fmt(a.ganho)} ({a.ganhoPercent >= 0 ? '+' : ''}{fmtPct(Math.abs(a.ganhoPercent))})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
