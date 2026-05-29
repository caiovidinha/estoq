import React, { useState, useEffect, useMemo } from 'react';
import InvestimentoTabs from '@/components/investimentos/InvestimentoTabs';
import { BsGraphUp } from 'react-icons/bs';
import { TbFlame } from 'react-icons/tb';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const fmt = (v) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtNum = (v, d = 1) => (v || 0).toFixed(d).replace('.', ',');

/** Compound monthly growth */
function monthlyRate(annualPct) {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/** FV after n months given PV, monthly contribution PMT, monthly rate r */
function fv(pv, pmt, r, n) {
  if (r === 0) return pv + pmt * n;
  return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
}

/** Months to reach target */
function monthsToFIRE(pv, pmt, r, target) {
  if (pv >= target) return 0;
  if (r === 0) {
    if (pmt <= 0) return Infinity;
    return Math.ceil((target - pv) / pmt);
  }
  // n = log((target + pmt/r) / (pv + pmt/r)) / log(1+r)
  const num = target + pmt / r;
  const den = pv + pmt / r;
  if (den <= 0 || num / den <= 0) return Infinity;
  return Math.ceil(Math.log(num / den) / Math.log(1 + r));
}

/** Build yearly projection data up to maxYears */
function buildProjection(pv, pmt, r, target, maxYears = 50) {
  const points = [];
  const months = maxYears * 12;
  for (let m = 0; m <= months; m += 12) {
    const value = fv(pv, pmt, r, m);
    points.push({ year: m / 12, value });
    if (value >= target * 1.1) break; // stop a bit past target
  }
  return points;
}

const InputField = ({ label, value, onChange, prefix, suffix, hint }) => (
  <div>
    <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-purple-400 transition-colors bg-white">
      {prefix && (
        <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">
          {prefix}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm focus:outline-none"
      />
      {suffix && (
        <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">
          {suffix}
        </span>
      )}
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const ResultCard = ({ label, value, sub, highlight }) => (
  <div
    className={`rounded-lg border p-4 ${
      highlight ? 'bg-purple-800 border-purple-700 text-white' : 'bg-white'
    }`}
  >
    <p className={`text-xs mb-1 ${highlight ? 'text-purple-200' : 'text-gray-500'}`}>{label}</p>
    <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    {sub && (
      <p className={`text-xs mt-1 ${highlight ? 'text-purple-200' : 'text-gray-400'}`}>{sub}</p>
    )}
  </div>
);

function parseInput(str) {
  return parseFloat((str || '0').replace(/\./g, '').replace(',', '.')) || 0;
}

export default function SimuladorFIRE() {
  // Load current patrimônio from API
  const [patrimonioAPI, setPatrimonioAPI] = useState(null);

  useEffect(() => {
    fetch('/api/investimentos/patrimonio')
      .then((r) => r.json())
      .then((j) => { if (j.success) setPatrimonioAPI(j.patrimonioTotal); })
      .catch(() => {});
  }, []);

  // Inputs
  const [patrimonio,    setPatrimonio]    = useState('');
  const [aporte,        setAporte]        = useState('');
  const [rendaAnual,    setRendaAnual]     = useState('10');
  const [rendaDesejada, setRendaDesejada]  = useState('');
  const [taxaRetirada,  setTaxaRetirada]   = useState('4');

  // Pre-fill patrimônio from API on first load
  useEffect(() => {
    if (patrimonioAPI != null && patrimonio === '') {
      setPatrimonio(
        patrimonioAPI.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
      );
    }
  }, [patrimonioAPI]);

  const calc = useMemo(() => {
    const pv     = parseInput(patrimonio);
    const pmt    = parseInput(aporte);
    const rate   = parseInput(rendaAnual);
    const renda  = parseInput(rendaDesejada);
    const taxa   = parseInput(taxaRetirada);

    if (renda <= 0 || taxa <= 0) return null;

    const r      = monthlyRate(rate);
    const target = (renda * 12) / (taxa / 100);
    const falta  = Math.max(0, target - pv);
    const meses  = monthsToFIRE(pv, pmt, r, target);
    const anos   = meses === Infinity ? null : meses / 12;
    const projection = buildProjection(pv, pmt, r, target, anos == null ? 50 : Math.ceil(anos) + 5);

    return { pv, pmt, r, target, falta, meses, anos, projection, renda, taxa };
  }, [patrimonio, aporte, rendaAnual, rendaDesejada, taxaRetirada]);

  const chartData = useMemo(() => {
    if (!calc) return null;
    const labels = calc.projection.map((p) => `${p.year.toFixed(0)}a`);
    const values = calc.projection.map((p) => p.value);
    const targetLine = calc.projection.map(() => calc.target);

    return {
      labels,
      datasets: [
        {
          label: 'Patrimônio projetado',
          data: values,
          borderColor: '#6d28d9',
          backgroundColor: 'rgba(109,40,217,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#6d28d9',
        },
        {
          label: 'Patrimônio FIRE',
          data: targetLine,
          borderColor: '#10b981',
          borderDash: [6, 3],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [calc]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.raw.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            })}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (v) =>
            v >= 1_000_000
              ? `R$ ${(v / 1_000_000).toFixed(1)}M`
              : `R$ ${(v / 1_000).toFixed(0)}k`,
          font: { size: 10 },
        },
      },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  return (
    <main className="bg-gray-100 min-h-screen pb-8">
      <title>Simulador FIRE — CF</title>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <BsGraphUp size={22} className="text-purple-700" />
          <h1 className="text-xl font-bold text-gray-800">Investimentos</h1>
        </div>
      </div>

      <InvestimentoTabs />

      <div className="px-4 space-y-4">
        {/* Inputs */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TbFlame size={18} className="text-orange-500" />
            <h2 className="font-bold text-gray-700">Parâmetros da simulação</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Patrimônio atual"
              value={patrimonio}
              onChange={setPatrimonio}
              prefix="R$"
              hint={patrimonioAPI != null ? `Carteira atual: ${fmt(patrimonioAPI)}` : 'Carregando...'}
            />
            <InputField
              label="Aporte mensal"
              value={aporte}
              onChange={setAporte}
              prefix="R$"
              hint="Quanto você investe por mês"
            />
            <InputField
              label="Rentabilidade esperada"
              value={rendaAnual}
              onChange={setRendaAnual}
              suffix="% a.a."
              hint="Histórico do IBOVESPA: ~13% nominal, ~7% real"
            />
            <InputField
              label="Renda passiva desejada"
              value={rendaDesejada}
              onChange={setRendaDesejada}
              prefix="R$"
              suffix="/mês"
              hint="Quanto você quer retirar por mês ao atingir FIRE"
            />
            <InputField
              label="Taxa de retirada segura"
              value={taxaRetirada}
              onChange={setTaxaRetirada}
              suffix="% a.a."
              hint="Regra dos 4% (safe withdrawal rate)"
            />
          </div>
        </div>

        {/* Results */}
        {calc ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ResultCard
                label="Patrimônio FIRE"
                value={fmt(calc.target)}
                sub={`${calc.taxa}% retirada ao ano`}
                highlight
              />
              <ResultCard
                label="Falta acumular"
                value={fmt(calc.falta)}
                sub={`${((calc.falta / calc.target) * 100).toFixed(0)}% do alvo`}
              />
              <ResultCard
                label="Tempo estimado"
                value={
                  calc.anos == null
                    ? '∞'
                    : calc.anos < 1
                    ? `${calc.meses} meses`
                    : `${fmtNum(calc.anos)} anos`
                }
                sub={calc.anos != null ? `≈ ${new Date().getFullYear() + Math.ceil(calc.anos)} anos` : 'Aumente o aporte'}
              />
              <ResultCard
                label="Renda mensal alvo"
                value={fmt(calc.renda)}
                sub="Renda passiva ao atingir FIRE"
              />
            </div>

            {/* Chart */}
            {chartData && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-bold text-gray-700 mb-4">Projeção do patrimônio</h3>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}

            {/* Milestones */}
            {calc.anos != null && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-bold text-gray-700 mb-3">Marcos da jornada</h3>
                <div className="space-y-2">
                  {[25, 50, 75, 100].map((pct) => {
                    const targetPct = calc.target * (pct / 100);
                    const mesesPct = monthsToFIRE(calc.pv, calc.pmt, calc.r, targetPct);
                    const anosPct = mesesPct === Infinity ? null : mesesPct / 12;
                    const anoCalendario = anosPct != null ? new Date().getFullYear() + Math.ceil(anosPct) : null;
                    return (
                      <div key={pct} className="flex items-center gap-3">
                        <div className="w-12 text-xs font-bold text-purple-700 shrink-0">{pct}%</div>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-right shrink-0 min-w-[120px]">
                          <span className="text-xs text-gray-700 font-semibold">{fmt(targetPct)}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {anoCalendario ? `≈ ${anoCalendario}` : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-400 text-sm">
            Preencha a renda mensal desejada para ver a simulação
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Simulação simplificada. Não considera inflação, impostos ou variações de mercado.
          Valores para fins de planejamento.
        </p>
      </div>
    </main>
  );
}
