import React, { useState, useEffect, useRef } from 'react';
import InvestimentoTabs from '@/components/investimentos/InvestimentoTabs';
import { BsGraphUp, BsSearch } from 'react-icons/bs';
import { HiRefresh, HiX, HiTrendingUp, HiTrendingDown, HiMinus } from 'react-icons/hi';

const fmt = (v) =>
  v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '\u2014';

const fmtPct = (v, d = 2) =>
  v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(d).replace('.', ',')}%` : '\u2014';

const fmtNum = (v, d = 2) => (v != null ? v.toFixed(d).replace('.', ',') : '\u2014');

const fmtVol = (v) => {
  if (v == null) return '\u2014';
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return v.toString();
};

// --- Diagnosis engine ---------------------------------------------------------

const RECOMENDACAO_MAP = {
  'strong_buy':   { label: 'Compra Forte',  color: 'text-green-700 bg-green-100',   icon: '\u2B06\u2B06' },
  'buy':          { label: 'Comprar',       color: 'text-green-600 bg-green-50',    icon: '\u2B06' },
  'hold':         { label: 'Segurar',       color: 'text-yellow-700 bg-yellow-100', icon: '\u27A1' },
  'sell':         { label: 'Vender',        color: 'text-red-600 bg-red-50',        icon: '\u2B07' },
  'strong_sell':  { label: 'Venda Forte',   color: 'text-red-700 bg-red-100',       icon: '\u2B07\u2B07' },
  'underperform': { label: 'Underperform',  color: 'text-orange-600 bg-orange-50',  icon: '\u2B07' },
};

function buildSignals(a) {
  const signals = [];
  let bullish = 0, bearish = 0;

  const add = (type, label, detail) => {
    signals.push({ type, label, detail });
    if (type === 'positive') bullish++;
    else if (type === 'negative') bearish++;
  };

  if (a.pl != null) {
    if (a.pl <= 0)       add('warning',  'P/L negativo', 'Empresa em prejuizo \u2014 analise o contexto');
    else if (a.pl < 15)  add('positive', `P/L ${fmtNum(a.pl)} \u2014 Barato`, 'Abaixo de 15x e historicamente atrativo');
    else if (a.pl < 25)  add('neutral',  `P/L ${fmtNum(a.pl)} \u2014 Neutro`, 'Faixa intermediaria');
    else                 add('negative', `P/L ${fmtNum(a.pl)} \u2014 Caro`, 'Acima de 25x exige crescimento robusto');
  }

  if (a.pvp != null) {
    if (a.pvp < 1)       add('positive', `P/VP ${fmtNum(a.pvp)} \u2014 Abaixo do VPA`, 'Cotacao abaixo do valor patrimonial');
    else if (a.pvp < 2)  add('neutral',  `P/VP ${fmtNum(a.pvp)} \u2014 Razoavel`, 'Premio moderado sobre o patrimonio');
    else                 add('negative', `P/VP ${fmtNum(a.pvp)} \u2014 Alto`, 'Mercado paga premio elevado sobre o patrimonio');
  }

  if (a.dy != null) {
    if (a.dy >= 8)       add('positive', `DY ${fmtNum(a.dy)}% \u2014 Excelente`, 'Yield elevado em comparacao ao CDI');
    else if (a.dy >= 5)  add('positive', `DY ${fmtNum(a.dy)}% \u2014 Bom`, 'Yield competitivo');
    else if (a.dy >= 2)  add('neutral',  `DY ${fmtNum(a.dy)}% \u2014 Baixo`, 'Foco em crescimento vs renda?');
    else if (a.dy > 0)   add('negative', `DY ${fmtNum(a.dy)}% \u2014 Muito baixo`, 'Retorno em dividendos minimo');
  }

  if (a.roe != null) {
    if (a.roe >= 20)     add('positive', `ROE ${fmtNum(a.roe)}% \u2014 Excelente`, 'Alta geracao de valor sobre o PL');
    else if (a.roe >= 10)add('positive', `ROE ${fmtNum(a.roe)}% \u2014 Bom`, 'Rentabilidade satisfatoria');
    else if (a.roe > 0)  add('neutral',  `ROE ${fmtNum(a.roe)}% \u2014 Baixo`, 'Rentabilidade abaixo da media');
    else                 add('negative', 'ROE negativo', 'Destruicao de valor sobre o patrimonio');
  }

  if (a.de != null) {
    if (a.de < 0.5)      add('positive', `D/PL ${fmtNum(a.de)}x \u2014 Baixa divida`, 'Estrutura de capital conservadora');
    else if (a.de < 2)   add('neutral',  `D/PL ${fmtNum(a.de)}x \u2014 Alavancagem moderada`, 'Aceitavel se geracao de caixa e forte');
    else                 add('negative', `D/PL ${fmtNum(a.de)}x \u2014 Alta alavancagem`, 'Divida elevada aumenta risco financeiro');
  }

  if (a.crescLucro != null && Math.abs(a.crescLucro) > 0.5) {
    if (a.crescLucro >= 20) add('positive', `Lucro +${fmtNum(a.crescLucro)}% a.a.`, 'Crescimento de lucro acelerado');
    else if (a.crescLucro > 0) add('neutral', `Lucro +${fmtNum(a.crescLucro)}% a.a.`, 'Crescimento positivo');
    else                    add('negative', `Lucro ${fmtNum(a.crescLucro)}% a.a.`, 'Lucro em queda');
  }

  if (a.beta != null) {
    if (a.beta < 0.8)      add('neutral', `Beta ${fmtNum(a.beta)} \u2014 Defensivo`, 'Menos volatil que o mercado');
    else if (a.beta > 1.5) add('warning', `Beta ${fmtNum(a.beta)} \u2014 Alta volatilidade`, 'Ativo muito sensivel ao mercado');
  }

  // 52-week position — works for ALL assets
  if (a.high52w != null && a.low52w != null && a.preco != null && a.high52w > a.low52w) {
    const pos = (a.preco - a.low52w) / (a.high52w - a.low52w);
    if (pos <= 0.15)
      add('positive', `Perto da minima de 52 sem (${(pos * 100).toFixed(0)}%)`, `Cotacao nos ${(pos * 100).toFixed(0)}% inferiores da faixa anual \u2014 possivel oportunidade tecnica`);
    else if (pos >= 0.85)
      add('neutral', `Perto da maxima de 52 sem (${(pos * 100).toFixed(0)}%)`, `Cotacao nos ${(pos * 100).toFixed(0)}% superiores da faixa anual \u2014 avalie momentum vs fundamentos`);
  }

  // FCF Yield
  if (a.fcfYield != null) {
    if (a.fcfYield >= 8)
      add('positive', `FCF Yield ${fmtNum(a.fcfYield)}% \u2014 Excelente`, 'Geracao de caixa livre elevada sobre o market cap');
    else if (a.fcfYield >= 4)
      add('positive', `FCF Yield ${fmtNum(a.fcfYield)}% \u2014 Bom`, 'Geracao de caixa livre competitiva');
    else if (a.fcfYield > 0)
      add('neutral',  `FCF Yield ${fmtNum(a.fcfYield)}% \u2014 Baixo`, 'Pouco caixa livre relativo ao valor de mercado');
    else
      add('negative', `FCF Yield negativo (${fmtNum(a.fcfYield)}%)`, 'Empresa consumindo caixa \u2014 avalie fase de investimento');
  }

  // P/FCF
  if (a.pFcf != null) {
    if (a.pFcf <= 0)
      add('warning',  'P/FCF negativo', 'FCF negativo \u2014 fase de investimento ou queima de caixa');
    else if (a.pFcf < 15)
      add('positive', `P/FCF ${fmtNum(a.pFcf)}x \u2014 Barato`, 'Preco atrativo vs. geracao de caixa livre');
    else if (a.pFcf < 25)
      add('neutral',  `P/FCF ${fmtNum(a.pFcf)}x \u2014 Razoavel`, 'Valuation moderado vs. FCF');
    else
      add('negative', `P/FCF ${fmtNum(a.pFcf)}x \u2014 Caro`, 'Preco elevado vs. geracao de caixa livre');
  }

  // Net Debt / EBITDA
  if (a.netDebtEbitda != null) {
    if (a.netDebtEbitda < 0)
      add('positive', `Div. Liq./EBITDA ${fmtNum(a.netDebtEbitda)}x \u2014 Caixa liq.`, 'Empresa com mais caixa do que dividas');
    else if (a.netDebtEbitda < 1.5)
      add('positive', `Div. Liq./EBITDA ${fmtNum(a.netDebtEbitda)}x \u2014 Baixo`, 'Alavancagem controlada e saudavel');
    else if (a.netDebtEbitda < 3)
      add('neutral',  `Div. Liq./EBITDA ${fmtNum(a.netDebtEbitda)}x \u2014 Moderado`, 'Alavancagem gerenciavel se geracao de caixa e estavel');
    else
      add('negative', `Div. Liq./EBITDA ${fmtNum(a.netDebtEbitda)}x \u2014 Alto`, 'Alavancagem elevada aumenta o risco financeiro');
  }

  // FCF growth
  if (a.crescFCF != null && Math.abs(a.crescFCF) > 1) {
    if (a.crescFCF >= 20)
      add('positive', `FCF +${fmtNum(a.crescFCF)}% a.a.`, 'Geracao de caixa livre em forte expansao');
    else if (a.crescFCF > 0)
      add('neutral',  `FCF +${fmtNum(a.crescFCF)}% a.a.`, 'FCF crescendo moderadamente');
    else
      add('negative', `FCF ${fmtNum(a.crescFCF)}% a.a.`, 'Geracao de caixa livre em queda');
  }

  if (a.precoAlvo != null && a.preco != null) {
    const upside = ((a.precoAlvo - a.preco) / a.preco) * 100;
    if (upside >= 15)    add('positive', `Upside ${fmtNum(upside)}% p/ preco alvo`, `Analistas: ${fmt(a.precoAlvo)} (${a.numAnalistas ?? '?'} analistas)`);
    else if (upside >= 0)add('neutral',  `Upside ${fmtNum(upside)}% p/ preco alvo`, `Analistas: ${fmt(a.precoAlvo)}`);
    else                 add('negative', `Downside ${fmtNum(Math.abs(upside))}% p/ preco alvo`, `Analistas: ${fmt(a.precoAlvo)}`);
  }

  const total = bullish + bearish;
  let verdict;
  if (total === 0)                        verdict = { label: 'Dados insuficientes',   color: 'text-gray-600 bg-gray-100' };
  else if (bullish >= 4 && bearish === 0) verdict = { label: 'Muito Atrativo',        color: 'text-green-700 bg-green-100' };
  else if (bullish > bearish * 1.5)       verdict = { label: 'Atrativo',              color: 'text-green-600 bg-green-50' };
  else if (bullish > bearish)             verdict = { label: 'Levemente Atrativo',    color: 'text-yellow-700 bg-yellow-100' };
  else if (bullish === bearish)           verdict = { label: 'Neutro',                color: 'text-yellow-600 bg-yellow-50' };
  else if (bearish > bullish * 1.5)       verdict = { label: 'Caro / Atencao',        color: 'text-red-600 bg-red-50' };
  else                                    verdict = { label: 'Levemente Caro',        color: 'text-orange-600 bg-orange-50' };

  return { signals, bullish, bearish, verdict };
}

// --- Signal icon --------------------------------------------------------------

const SignalIcon = ({ type }) => {
  if (type === 'positive') return <HiTrendingUp   size={14} className="text-green-600 shrink-0 mt-0.5" />;
  if (type === 'negative') return <HiTrendingDown size={14} className="text-red-500   shrink-0 mt-0.5" />;
  if (type === 'warning')  return <span className="text-yellow-500 text-xs shrink-0 mt-0.5">{'⚠'}</span>;
  return <HiMinus size={14} className="text-gray-400 shrink-0 mt-0.5" />;
};

// --- 52-week range bar --------------------------------------------------------

const RangeBar = ({ low, high, current }) => {
  if (low == null || high == null || current == null || high === low) return null;
  const pct = Math.min(Math.max(((current - low) / (high - low)) * 100, 0), 100);
  return (
    <div className="mt-1">
      <div className="relative h-1.5 bg-white/20 rounded-full">
        <div
          className="absolute top-[-3px] w-3 h-3 bg-white rounded-full border-2 border-purple-400 shadow"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-purple-300 mt-1.5">
        <span>{fmt(low)}</span>
        <span className="text-white font-semibold">{fmt(current)}</span>
        <span>{fmt(high)}</span>
      </div>
    </div>
  );
};

// --- Diagnostic card ----------------------------------------------------------

const DiagnosticoCard = ({ ativo, onClose }) => {
  const [showDesc, setShowDesc] = useState(false);
  const { signals, bullish, bearish, verdict } = buildSignals(ativo);
  const analistas = RECOMENDACAO_MAP[(ativo.recomendacao || '').toLowerCase()] || null;

  const MetaRow = ({ label, value }) =>
    value != null ? (
      <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-800">{value}</span>
      </div>
    ) : null;

  return (
    <div className="bg-white rounded-xl border shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-800 text-white p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {ativo.logo ? (
              <img
                src={ativo.logo}
                alt={ativo.ticker}
                className="w-10 h-10 rounded-full bg-white object-contain p-0.5 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {ativo.ticker?.slice(0, 2)}
              </div>
            )}
            <div>
              <p className="text-xl font-bold leading-tight">{ativo.ticker}</p>
              <p className="text-purple-200 text-sm">{ativo.nome}</p>
              {(ativo.setor || ativo.industria) && (
                <p className="text-purple-300 text-xs mt-0.5">
                  {ativo.setor}
                  {ativo.industria && ativo.industria !== ativo.setor ? ` \u00b7 ${ativo.industria}` : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white ml-2 shrink-0 p-1">
            <HiX size={20} />
          </button>
        </div>

        <div className="mt-3 flex items-end gap-3">
          <p className="text-3xl font-bold">{fmt(ativo.preco)}</p>
          {ativo.varDia != null && (
            <span className={`text-sm font-semibold pb-0.5 ${ativo.varDia >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {fmtPct(ativo.varDia)} ({fmt(ativo.varAbs)})
            </span>
          )}
        </div>

        {ativo.high52w && (
          <div className="mt-3">
            <p className="text-xs text-purple-300 mb-1">Min / Max 52 semanas</p>
            <RangeBar low={ativo.low52w} high={ativo.high52w} current={ativo.preco} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
        {/* Fundamentals col */}
        <div className="p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Indicadores</p>
          <MetaRow label="P/L (trailing)"      value={ativo.pl       != null ? fmtNum(ativo.pl)        : null} />
          <MetaRow label="P/L (forward)"       value={ativo.plFwd    != null ? fmtNum(ativo.plFwd)     : null} />
          <MetaRow label="P/VP"                value={ativo.pvp      != null ? fmtNum(ativo.pvp)       : null} />
          <MetaRow label="EV/EBITDA"           value={ativo.evEbitda != null ? fmtNum(ativo.evEbitda)  : null} />
          <MetaRow label="DY"                  value={ativo.dy       != null ? `${fmtNum(ativo.dy)}%`  : null} />
          <MetaRow label="ROE"                 value={ativo.roe      != null ? `${fmtNum(ativo.roe)}%` : null} />
          <MetaRow label="ROA"                 value={ativo.roa      != null ? `${fmtNum(ativo.roa)}%` : null} />
          <MetaRow label="Margem Liquida"      value={ativo.margem   != null ? `${fmtNum(ativo.margem)}%`   : null} />
          <MetaRow label="Margem EBIT"         value={ativo.margemOp != null ? `${fmtNum(ativo.margemOp)}%` : null} />
          <MetaRow label="Divida / PL"         value={ativo.de            != null ? `${fmtNum(ativo.de)}x`     : null} />
          <MetaRow label="Div. Liq./EBITDA"    value={ativo.netDebtEbitda != null ? `${fmtNum(ativo.netDebtEbitda)}x` : null} />
          <MetaRow label="Current Ratio"       value={ativo.currentRatio  != null ? fmtNum(ativo.currentRatio) : null} />
          <MetaRow label="FCF Yield"            value={ativo.fcfYield      != null ? `${fmtNum(ativo.fcfYield)}%`  : null} />
          <MetaRow label="P/FCF"               value={ativo.pFcf          != null ? `${fmtNum(ativo.pFcf)}x`     : null} />
          <MetaRow label="Beta"                value={ativo.beta          != null ? fmtNum(ativo.beta)          : null} />
        </div>

        {/* Market col */}
        <div className="p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mercado & Analistas</p>
          <MetaRow label="Abertura"            value={ativo.abertura   != null ? fmt(ativo.abertura)   : null} />
          <MetaRow label="Maxima do dia"       value={ativo.maxDia     != null ? fmt(ativo.maxDia)     : null} />
          <MetaRow label="Minima do dia"       value={ativo.minDia     != null ? fmt(ativo.minDia)     : null} />
          <MetaRow label="Volume (dia)"        value={ativo.volume     != null ? fmtVol(ativo.volume)    : null} />
          <MetaRow label="Vol. medio 3m"       value={ativo.volumeMed  != null ? fmtVol(ativo.volumeMed) : null} />
          <MetaRow label="Market Cap"          value={ativo.marketCap  != null ? `R$ ${fmtVol(ativo.marketCap)}` : null} />
          <MetaRow label="Cresc. Lucro a.a."   value={ativo.crescLucro   != null ? fmtPct(ativo.crescLucro)   : null} />
          <MetaRow label="Cresc. Receita a.a." value={ativo.crescReceita != null ? fmtPct(ativo.crescReceita) : null} />
          <MetaRow label="Cresc. FCF a.a."     value={ativo.crescFCF    != null ? fmtPct(ativo.crescFCF)    : null} />
          {ativo.precoAlvo != null && (
            <>
              <MetaRow label="Preco Alvo medio" value={fmt(ativo.precoAlvo)} />
              <MetaRow label="Preco Alvo max"   value={ativo.precoAlvoMax != null ? fmt(ativo.precoAlvoMax) : null} />
              <MetaRow label="Preco Alvo min"   value={ativo.precoAlvoMin != null ? fmt(ativo.precoAlvoMin) : null} />
              <MetaRow label="Nr analistas"     value={ativo.numAnalistas} />
            </>
          )}
        </div>

        {/* Diagnosis col */}
        <div className="p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Diagnostico</p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${verdict.color}`}>
              {verdict.label}
            </span>
            {analistas && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${analistas.color}`}>
                {analistas.icon} {analistas.label}
              </span>
            )}
          </div>

          {(bullish + bearish) > 0 && (
            <div className="mb-3">
              <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-green-400 h-full transition-all"
                  style={{ width: `${(bullish / (bullish + bearish)) * 100}%` }}
                />
                <div
                  className="bg-red-400 h-full transition-all"
                  style={{ width: `${(bearish / (bullish + bearish)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-600">+ {bullish} positivos</span>
                <span className="text-red-500">- {bearish} negativos</span>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {signals.map((s, i) => (
              <div key={i} className="flex gap-2">
                <SignalIcon type={s.type} />
                <div>
                  <p className="text-xs font-semibold text-gray-700 leading-tight">{s.label}</p>
                  {s.detail && <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-300 mt-3 leading-relaxed">
            Analise automatica. Nao e recomendacao de investimento.
          </p>
        </div>
      </div>

      {ativo.descricao && (
        <div className="px-4 pb-4 border-t pt-3">
          <button
            onClick={() => setShowDesc(!showDesc)}
            className="text-xs font-bold text-gray-500 uppercase tracking-wide hover:text-gray-700 mb-1 flex items-center gap-1"
          >
            Sobre a empresa {showDesc ? '\u25b2' : '\u25bc'}
          </button>
          {showDesc && <p className="text-xs text-gray-600 leading-relaxed">{ativo.descricao}</p>}
        </div>
      )}
    </div>
  );
};

// --- Color helpers ------------------------------------------------------------

function plColor(pl) {
  if (pl == null) return 'text-gray-400';
  if (pl <= 0)  return 'text-gray-400';
  if (pl < 15)  return 'text-green-600';
  if (pl < 25)  return 'text-yellow-600';
  return 'text-red-500';
}
function pvpColor(pvp) {
  if (pvp == null) return 'text-gray-400';
  if (pvp < 1)  return 'text-green-600';
  if (pvp < 2)  return 'text-yellow-600';
  return 'text-red-500';
}
function dyColor(dy) {
  if (dy == null) return 'text-gray-400';
  if (dy >= 8)  return 'text-green-600';
  if (dy >= 4)  return 'text-yellow-600';
  return 'text-gray-500';
}
function roeColor(roe) {
  if (roe == null) return 'text-gray-400';
  if (roe >= 15) return 'text-green-600';
  if (roe >= 8)  return 'text-yellow-600';
  return 'text-red-500';
}

const MetricCell = ({ value, colorFn, suffix = '' }) => {
  const color = colorFn ? colorFn(value) : 'text-gray-700';
  return (
    <td className={`py-2 text-right text-sm font-semibold ${color}`}>
      {value != null ? `${fmtNum(value)}${suffix}` : <span className="text-gray-300 font-normal">{'—'}</span>}
    </td>
  );
};

// --- Main page ----------------------------------------------------------------

export default function ValuationPage() {
  const [dados, setDados]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('Todos');

  const [query,        setQuery]        = useState('');
  const [searching,    setSearching]    = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError,  setSearchError]  = useState(null);
  const topRef = useRef(null);

  const fetchDados = async () => {
    try {
      const res  = await fetch('/api/investimentos/valuation');
      const json = await res.json();
      if (json.success) { setDados(json); setError(null); }
      else setError(json.error || 'Erro ao carregar dados');
    } catch { setError('Erro de conexao'); }
  };

  useEffect(() => { fetchDados().finally(() => setLoading(false)); }, []);

  const handleRefresh = async () => { setRefreshing(true); await fetchDados(); setRefreshing(false); };

  const handleSearch = async (e) => {
    e?.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError(null);
    try {
      const res  = await fetch(`/api/investimentos/valuation?search=${encodeURIComponent(ticker)}`);
      const json = await res.json();
      if (json.success) {
        setSearchResult(json.ativo);
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setSearchError(json.error || 'Ticker nao encontrado');
      }
    } catch { setSearchError('Erro de conexao'); }
    finally  { setSearching(false); }
  };

  const clearSearch = () => { setQuery(''); setSearchResult(null); setSearchError(null); };

  const tipos = dados?.ativos
    ? ['Todos', ...new Set(dados.ativos.map((a) => a.tipo).filter(Boolean))]
    : ['Todos'];

  const ativos = (dados?.ativos || []).filter(
    (a) => filtroTipo === 'Todos' || a.tipo === filtroTipo
  );

  return (
    <main className="bg-gray-100 min-h-screen pb-8" ref={topRef}>
      <title>Valuation — CF</title>

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

      <div className="px-4 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5
                          focus-within:border-purple-400 transition-colors shadow-sm">
            <BsSearch size={15} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Analisar qualquer ativo — ex: PETR4, MXRF11, IVVB11..."
              className="flex-1 text-sm focus:outline-none placeholder-gray-400 bg-transparent"
            />
            {query && (
              <button type="button" onClick={clearSearch} className="text-gray-300 hover:text-gray-500">
                <HiX size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || searching}
            className="bg-purple-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold
                       hover:bg-purple-700 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {searching ? '...' : 'Analisar'}
          </button>
        </form>

        {searchError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {searchError}
          </div>
        )}

        {searchResult && (
          <DiagnosticoCard ativo={searchResult} onClose={clearSearch} />
        )}

        {/* Legend */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span><span className="text-green-600 font-semibold">Verde</span> = atrativo</span>
            <span><span className="text-yellow-600 font-semibold">Amarelo</span> = neutro</span>
            <span><span className="text-red-500 font-semibold">Vermelho</span> = caro / atencao</span>
            <span className="ml-auto hidden sm:block text-gray-400">
              P/L &lt;15 · P/VP &lt;1 · DY &gt;8% · ROE &gt;15% = positivo
            </span>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 flex-wrap">
          {tipos.map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${filtroTipo === t
                  ? 'bg-purple-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20 text-gray-400">
            Carregando fundamentais via Brapi...
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b bg-gray-50">
                    <th className="py-3 px-4 font-semibold">Ativo</th>
                    <th className="py-3 px-3 font-semibold text-right">Preco</th>
                    <th className="py-3 px-3 font-semibold text-right">Dia</th>
                    <th className="py-3 px-3 font-semibold text-right" title="P/L trailing">P/L</th>
                    <th className="py-3 px-3 font-semibold text-right" title="P/VP">P/VP</th>
                    <th className="py-3 px-3 font-semibold text-right" title="Dividend Yield">DY%</th>
                    <th className="py-3 px-3 font-semibold text-right" title="Return on Equity">ROE%</th>
                    <th className="py-3 px-3 font-semibold text-right" title="Beta">Beta</th>
                    <th className="py-3 px-4 font-semibold">Setor</th>
                    <th className="py-3 px-3 font-semibold text-center">Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {ativos.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-400 text-sm">
                        Nenhum ativo encontrado
                      </td>
                    </tr>
                  ) : (
                    ativos.map((a) => (
                      <tr
                        key={a.ticker}
                        className="border-b last:border-0 hover:bg-purple-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setQuery(a.ticker);
                          setSearchResult(a);
                          topRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <td className="py-3 px-4">
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
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800">{a.ticker}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[130px]">{a.nome}</p>
                            </div>
                            <span className="ml-1 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                              {a.tipo}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-gray-800">
                          {a.preco != null ? fmt(a.preco) : '\u2014'}
                        </td>
                        <td className={`py-3 px-3 text-right text-sm font-semibold ${
                          a.varDia == null ? 'text-gray-400' : a.varDia >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {a.varDia != null ? fmtPct(a.varDia) : '\u2014'}
                        </td>
                        <MetricCell value={a.pl}  colorFn={plColor} />
                        <MetricCell value={a.pvp} colorFn={pvpColor} />
                        <MetricCell value={a.dy}  colorFn={dyColor} suffix="%" />
                        <MetricCell value={a.roe} colorFn={roeColor} suffix="%" />
                        <td className="py-3 px-3 text-right text-sm text-gray-600">
                          {a.beta != null ? fmtNum(a.beta) : <span className="text-gray-300">{'—'}</span>}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 max-w-[160px]">
                          <p className="truncate">{a.setor || '\u2014'}</p>
                          {a.industria && a.industria !== a.setor && (
                            <p className="truncate text-gray-400">{a.industria}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-xs text-purple-600 font-semibold hover:underline">
                            Detalhar
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {ativos.length > 0 && (
              <p className="text-xs text-gray-400 p-3 text-center border-t">
                Clique em qualquer linha para diagnostico completo \u00b7 Dados via Brapi \u00b7 cache 5 min
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
