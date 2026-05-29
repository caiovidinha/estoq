import React, { useState, useEffect } from 'react';
import InvestimentoTabs from '@/components/investimentos/InvestimentoTabs';
import { BsGraphUp } from 'react-icons/bs';
import { HiRefresh, HiExclamation, HiCheckCircle, HiArrowUp, HiArrowDown } from 'react-icons/hi';

const fmt = (v) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtPct = (v) => {
  const n = v || 0;
  return (n >= 0 ? '+' : '') + n.toFixed(1).replace('.', ',') + '%';
};

const STATUS_CONFIG = {
  subponderado:    { label: 'Subponderado', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  superponderado:  { label: 'Superponderado', color: 'text-red-600 bg-red-50 border-red-100' },
  ok:              { label: 'Balanceado', color: 'text-green-700 bg-green-50 border-green-200' },
};

function AllocationBar({ atual, alvo }) {
  const max = Math.max(atual, alvo, 1);
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 relative h-2 bg-gray-100 rounded-full overflow-visible">
        {/* Atual */}
        <div
          className="absolute top-0 left-0 h-2 rounded-full bg-purple-500"
          style={{ width: `${Math.min((atual / max) * 100, 100)}%` }}
        />
        {/* Alvo marker */}
        {alvo > 0 && (
          <div
            className="absolute top-[-3px] w-0.5 h-[14px] bg-gray-700 rounded"
            style={{ left: `${Math.min((alvo / max) * 100, 100)}%` }}
            title={`Alvo: ${alvo.toFixed(1)}%`}
          />
        )}
      </div>
    </div>
  );
}

function AporteCalculator({ recomendacoes, patrimonioTotal }) {
  const [aporte, setAporte] = useState('');

  const aporteNum = parseFloat(
    (aporte || '0').replace(/\./g, '').replace(',', '.')
  ) || 0;

  const totalFuturo = patrimonioTotal + aporteNum;

  // Distribute the aporte proportionally to close the gap for underweight types
  const sugestoes = React.useMemo(() => {
    if (aporteNum <= 0 || recomendacoes.length === 0) return [];

    const underweight = recomendacoes.filter((r) => r.diffPct > 1 && r.alvoPct > 0);
    if (underweight.length === 0) return [];

    const totalDiff = underweight.reduce((s, r) => s + r.diffPct, 0);

    return underweight.map((r) => {
      const frac = r.diffPct / totalDiff;
      const valor = aporteNum * frac;
      return { tipo: r.tipo, valor, pctAporte: frac * 100 };
    });
  }, [aporteNum, recomendacoes]);

  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-bold text-gray-700 mb-3">Onde investir no próximo aporte?</h3>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Valor do aporte (R$)</label>
          <input
            type="text"
            value={aporte}
            onChange={(e) => setAporte(e.target.value)}
            placeholder="Ex: 2.000"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {aporteNum > 0 && sugestoes.length > 0 && (
        <div className="space-y-2">
          {sugestoes.map((s) => (
            <div key={s.tipo} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{s.tipo}</p>
                <p className="text-xs text-gray-500">{s.pctAporte.toFixed(0)}% do aporte</p>
              </div>
              <p className="text-lg font-bold text-purple-700">{fmt(s.valor)}</p>
            </div>
          ))}
        </div>
      )}

      {aporteNum > 0 && sugestoes.length === 0 && (
        <p className="text-sm text-green-600 flex items-center gap-2">
          <HiCheckCircle size={16} />
          Carteira já está balanceada! Invista em qualquer categoria.
        </p>
      )}

      {aporteNum <= 0 && (
        <p className="text-sm text-gray-400 text-center py-2">
          Digite um valor para ver a sugestão de alocação
        </p>
      )}
    </div>
  );
}

export default function RebalanceamentoPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDados = async () => {
    try {
      const res = await fetch('/api/investimentos/rebalanceamento');
      const json = await res.json();
      if (json.success) {
        setDados(json);
        setError(null);
      } else {
        setError(json.error || 'Erro ao carregar dados');
      }
    } catch {
      setError('Erro de conexão');
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

  return (
    <main className="bg-gray-100 min-h-screen pb-8">
      <title>Rebalanceamento — CF</title>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <BsGraphUp size={22} className="text-purple-700" />
          <h1 className="text-xl font-bold text-gray-800">Investimentos</h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <HiRefresh size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <InvestimentoTabs />

      {loading && (
        <div className="flex justify-center items-center py-20 text-gray-400">Carregando...</div>
      )}
      {error && (
        <div className="mx-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && dados && (
        <div className="px-4 space-y-4">
          {/* No target sheet warning */}
          {!dados.temAlvo && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <HiExclamation size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Alocação alvo não configurada</p>
                <p className="text-yellow-700 mt-0.5">
                  Crie uma aba <strong>Alocacao</strong> no Google Sheets com duas colunas:
                  <strong> Tipo</strong> (ex: &quot;Ação&quot;) e <strong>% Alvo</strong> (ex: 40).
                  Os valores devem somar 100.
                </p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">Patrimônio Total</p>
            <p className="text-2xl font-bold text-gray-900">{fmt(dados.patrimonioTotal)}</p>
          </div>

          {/* Allocation table */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-bold text-gray-700 mb-4">Alocação Atual vs Alvo</h2>
            <div className="space-y-4">
              {dados.recomendacoes.length > 0 ? (
                dados.recomendacoes.map((r) => {
                  const cfg = STATUS_CONFIG[r.status];
                  return (
                    <div key={r.tipo} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">{r.tipo}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">{fmt(r.valorAtual)}</p>
                          <p className="text-xs text-gray-500">
                            {r.atualPct.toFixed(1)}%
                            {r.alvoPct > 0 && (
                              <>
                                {' '}→ alvo {r.alvoPct.toFixed(0)}%{' '}
                                <span
                                  className={`font-semibold ${
                                    r.diffPct > 0 ? 'text-yellow-600' : r.diffPct < 0 ? 'text-red-500' : 'text-green-600'
                                  }`}
                                >
                                  ({r.diffPct >= 0 ? '+' : ''}{r.diffPct.toFixed(1)}%)
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {r.alvoPct > 0 && (
                        <AllocationBar atual={r.atualPct} alvo={r.alvoPct} />
                      )}
                    </div>
                  );
                })
              ) : (
                // No target — just show current
                Object.entries(dados.alocacaoAtual).map(([tipo, pct]) => (
                  <div key={tipo} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                    <p className="font-semibold text-gray-800">{tipo}</p>
                    <div className="text-right">
                      <p className="text-sm font-bold">{fmt(dados.patrimonioPorTipo[tipo] || 0)}</p>
                      <p className="text-xs text-gray-500">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {dados.temAlvo && (
              <div className="mt-4 pt-3 border-t flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-1.5 bg-purple-500 rounded-sm" />
                  Atual
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-0.5 h-3 bg-gray-700 rounded-sm" />
                  Alvo
                </span>
              </div>
            )}
          </div>

          {/* Summary recommendations */}
          {dados.temAlvo && dados.recomendacoes.some((r) => r.status !== 'ok') && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-bold text-gray-700 mb-3">Resumo das ações sugeridas</h3>
              <div className="space-y-2">
                {dados.recomendacoes
                  .filter((r) => r.status !== 'ok')
                  .map((r) => (
                    <div key={r.tipo} className="flex items-center gap-2 text-sm">
                      {r.status === 'subponderado' ? (
                        <HiArrowUp size={14} className="text-yellow-600 shrink-0" />
                      ) : (
                        <HiArrowDown size={14} className="text-red-500 shrink-0" />
                      )}
                      <p className="text-gray-700">
                        <strong>{r.tipo}</strong>{' '}
                        {r.status === 'subponderado'
                          ? `está ${Math.abs(r.diffPct).toFixed(1)}pp abaixo do alvo — priorize aportes`
                          : `está ${Math.abs(r.diffPct).toFixed(1)}pp acima do alvo — evite novos aportes`}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Aporte calculator */}
          {dados.temAlvo && (
            <AporteCalculator
              recomendacoes={dados.recomendacoes}
              patrimonioTotal={dados.patrimonioTotal}
            />
          )}
        </div>
      )}
    </main>
  );
}
