import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AddExpenseModalConta from '@/components/AddExpenseModalConta';
import AddIncomeModalConta from '@/components/AddIncomeModalConta';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Sober/muted balance colours (used for Horizonte cells + grid icon)
const BAL = {
  darkGreen:  '#1a7a3a',
  lightGreen: '#5a9e6f',
  yellow:     '#b8942a',
  lightRed:   '#b05252',
  darkRed:    '#c0202f',
};

// Solid type colours
const TC = {
  receitas:  '#1b6e2f',
  despesas:  '#b52b2b',
  diarios:   '#c2185b',
  economias: '#2e7d54',
  cartao:    '#5e35b1',
};

const TYPE_KEYS = ['receitas', 'despesas', 'diarios', 'economias', 'cartao'];

const FILTER_OPTS = [
  { key: 'receitas',  label: 'Receitas'           },
  { key: 'despesas',  label: 'Despesas'            },
  { key: 'diarios',   label: 'Diários'             },
  { key: 'economias', label: 'Economias'           },
  { key: 'cartao',    label: 'Gastos com cartão'   },
  { key: 'todas',     label: 'Todas'               },
];

const ACTIVE_COLOR = '#f97316';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function dailyBalance(row) {
  return row.receitas + row.economias - row.despesas - row.diarios - row.cartao;
}

function balColor(val) {
  if (val > 2000)  return BAL.darkGreen;
  if (val > 1000)  return BAL.lightGreen;
  if (val >= 0)    return BAL.yellow;
  if (val >= -500) return BAL.lightRed;
  return BAL.darkRed;
}

function balBgColor(val) {
  if (val > 2000)  return '#bbf7d0';
  if (val > 1000)  return '#d1fae5';
  if (val >= 0)    return '#fef3c7';
  if (val >= -500) return '#fee2e2';
  return '#fecaca';
}

function fmtBRL(val) {
  if (val === 0) return 'R$ 0,00';
  const neg = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  return neg + 'R$\u00a0' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtHorizonte(val) {
  const abs = Math.abs(val);
  const neg = val < 0 ? '-' : '';
  if (abs >= 1000000) return `${neg}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1000)    return `${neg}${(abs / 1000).toFixed(1).replace('.', ',')}K`;
  return `${neg}${abs.toLocaleString('pt-BR')}`;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function CalendarIcon({ day, size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 34">
      <rect x={1} y={8} width={30} height={24} rx={3} fill="white" stroke="#d1d5db" strokeWidth={1.2}/>
      <rect x={1} y={8} width={30} height={9}  rx={3} fill="#ef4444"/>
      <rect x={1} y={13} width={30} height={4} fill="#ef4444"/>
      <rect x={9}  y={4} width={3} height={8} rx={1.5} fill="#6b7280"/>
      <rect x={20} y={4} width={3} height={8} rx={1.5} fill="#6b7280"/>
      {day != null && (
        <text x={16} y={28} textAnchor="middle" fontSize={12} fontWeight="700" fill="#111827" stroke="none">{day}</text>
      )}
    </svg>
  );
}

const ChevronLeft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRight = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const CloseIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <line x1={18} y1={6}  x2={6}  y2={18} />
    <line x1={6}  y1={6}  x2={18} y2={18} />
  </svg>
);

const CheckIcon = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={TC.receitas} strokeWidth={2.5} strokeLinecap="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const ChevronDown = () => (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1={3} y1={6}  x2={21} y2={6}  />
    <line x1={3} y1={12} x2={21} y2={12} />
    <line x1={3} y1={18} x2={21} y2={18} />
  </svg>
);

const TagIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1={7} y1={7} x2={7.01} y2={7}/>
  </svg>
);

const TableIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <rect x={3} y={3} width={18} height={18} rx={2} />
    <line x1={3}  y1={9}  x2={21} y2={9}  />
    <line x1={3}  y1={15} x2={21} y2={15} />
    <line x1={9}  y1={9}  x2={9}  y2={21} />
  </svg>
);

const TotaisIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1={4}  y1={6}  x2={11} y2={6}/>
    <line x1={13} y1={6}  x2={20} y2={6}/>
    <circle cx={12} cy={6}  r={1.5} fill="currentColor" stroke="none"/>
    <line x1={4}  y1={12} x2={7}  y2={12}/>
    <line x1={9}  y1={12} x2={20} y2={12}/>
    <circle cx={8}  cy={12} r={1.5} fill="currentColor" stroke="none"/>
    <line x1={4}  y1={18} x2={15} y2={18}/>
    <line x1={17} y1={18} x2={20} y2={18}/>
    <circle cx={16} cy={18} r={1.5} fill="currentColor" stroke="none"/>
  </svg>
);

const DiarioIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x={3} y={3} width={18} height={18} rx={2}/>
    <line x1={3} y1={9} x2={21} y2={9}/>
    <line x1={9} y1={9} x2={9} y2={21}/>
    <line x1={14} y1={14} x2={17} y2={14}/>
    <line x1={14} y1={17} x2={17} y2={17}/>
  </svg>
);

// ─── Type Circle Icons ────────────────────────────────────────────────────────
function ArrowInCircle({ size = 22 }) {
  const inner = size * 0.58;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: TC.receitas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1={18} y1={6}  x2={6}  y2={18} />
        <polyline points="6,10 6,18 14,18" />
      </svg>
    </div>
  );
}

function ArrowOutCircle({ size = 22 }) {
  const inner = size * 0.58;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: TC.despesas, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1={6} y1={18} x2={18} y2={6} />
        <polyline points="10,6 18,6 18,14" />
      </svg>
    </div>
  );
}

function LetterCircle({ letter, bg, size = 22 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.5, lineHeight: 1, color: 'white', fontWeight: 700 }}>{letter}</span>
    </div>
  );
}

function GrayGridCircles({ size = 22 }) {
  const r   = size * 0.2;
  const gap = size * 0.12;
  const x0  = size / 2 - r - gap / 2;
  const x1  = size / 2 + r + gap / 2;
  const positions = [
    { cx: x0, cy: x0 },
    { cx: x1, cy: x0 },
    { cx: x0, cy: x1 },
    { cx: x1, cy: x1 },
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
      {positions.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={r} fill="#9ca3af" />
      ))}
    </svg>
  );
}
function FixedDailyIcon({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px dashed ${TC.diarios}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.5, color: TC.diarios, fontWeight: 700, lineHeight: 1 }}>D</span>
    </div>
  );
}
// 3×3 grid of coloured squares (header icon)
function ColorGridIcon({ size = 26 }) {
  const colors = [
    BAL.darkGreen,  BAL.lightGreen, BAL.yellow,
    BAL.lightRed,   BAL.darkRed,    BAL.lightGreen,
    BAL.yellow,     BAL.darkGreen,  BAL.lightRed,
  ];
  const cell = size / 4;
  const gap  = size / 14;
  const total = 3 * cell + 2 * gap;
  const off = (size - total) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {colors.map((c, i) => (
        <rect
          key={i}
          x={off + (i % 3) * (cell + gap)}
          y={off + Math.floor(i / 3) * (cell + gap)}
          width={cell}
          height={cell}
          rx={1.5}
          fill={c}
        />
      ))}
    </svg>
  );
}

function TypeIconComp({ typeKey, size = 22 }) {
  switch (typeKey) {
    case 'receitas':  return <ArrowInCircle size={size} />;
    case 'despesas':  return <ArrowOutCircle size={size} />;
    case 'diarios':   return <LetterCircle letter="D" bg={TC.diarios}   size={size} />;
    case 'economias': return <LetterCircle letter="E" bg={TC.economias} size={size} />;
    case 'cartao':    return <LetterCircle letter="C" bg={TC.cartao}    size={size} />;
    case 'todas':     return <GrayGridCircles size={size} />;
    default: return null;
  }
}

// ─── Filter Bottom Sheet ──────────────────────────────────────────────────────
const FILTER_OPTS_NO_ALL = FILTER_OPTS.filter(o => o.key !== 'todas');

function FilterSheet({ value, onChange, onClose, options, zIndex = 60 }) {
  const opts = options || FILTER_OPTS;
  return (
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ zIndex, background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-2xl shadow-2xl" style={{ animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold text-gray-800">Mostrar</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>

        {opts.map((opt, idx) => (
          <div key={opt.key}>
            <button
              className="w-full flex items-center gap-3 px-5 py-3.5 active:bg-gray-50"
              onClick={() => { onChange(opt.key); onClose(); }}
            >
              <TypeIconComp typeKey={opt.key} size={28} />
              <span className={`text-sm flex-1 text-left ${value === opt.key ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                {opt.label}
              </span>
              {value === opt.key && <CheckIcon />}
            </button>
            {idx < opts.length - 1 && (
              <div className="mx-5 h-px bg-gray-100" />
            )}
          </div>
        ))}
        <div style={{ height: 'max(env(safe-area-inset-bottom), 16px)' }} />
      </div>
    </div>
  );
}

// ─── Inline Add Transaction (Day Detail) ────────────────────────────────────
const MESES_NOMES_FULL = [
  '01 - JANEIRO','02 - FEVEREIRO','03 - MARÇO','04 - ABRIL',
  '05 - MAIO','06 - JUNHO','07 - JULHO','08 - AGOSTO',
  '09 - SETEMBRO','10 - OUTUBRO','11 - NOVEMBRO','12 - DEZEMBRO',
];

// Renders a hidden instance of the expense/income modal and auto-opens it
function HiddenModalTrigger({ type }) {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const btn = ref.current?.querySelector('button');
      if (btn) btn.click();
    }, 40);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ position: 'fixed', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
      {type === 'DESPESA' ? <AddExpenseModalConta/> : <AddIncomeModalConta/>}
    </div>
  );
}

// Type picker bottom sheet: choose DESPESA or RECEITA before opening the real modal
function TypePickerSheet({ onClose, onPick }) {
  return (
    <div className="fixed inset-0 z-[76] flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="flex-1" onClick={onClose}/>
      <div className="bg-white rounded-t-2xl shadow-2xl px-5 pt-5" style={{ animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
        <div className="text-base font-bold text-gray-800 mb-4">Nova transação</div>
        <div className="flex gap-3 mb-4">
          <button onClick={() => onPick('DESPESA')} className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold text-sm active:opacity-70">
            Despesa
          </button>
          <button onClick={() => onPick('RECEITA')} className="flex-1 py-3 rounded-xl bg-green-50 text-green-600 border border-green-200 font-semibold text-sm active:opacity-70">
            Receita
          </button>
        </div>
        <div style={{ height: 'max(env(safe-area-inset-bottom), 8px)' }}/>
      </div>
    </div>
  );
}

// ─── Day Detail Sheet ─────────────────────────────────────────────────────────
function DayDetailSheet({ initialDay, month, year, initialTipo, onClose, onRefreshMonth, diarioAlvo }) {
  const [day,           setDay]        = useState(initialDay);
  const [tipo,          setTipo]       = useState(initialTipo === 'todas' ? 'diarios' : initialTipo);
  const [showFilter,    setShowFilter] = useState(false);
  const [showTypePicker,setShowTypePicker] = useState(false);
  const [activeModal,   setActiveModal]= useState(null); // 'DESPESA' | 'RECEITA'
  const [modalKey,      setModalKey]   = useState(0);
  const [allItems,      setAllItems]   = useState(null);
  const [loading,       setLoading]    = useState(true);

  const daysInM     = new Date(year, month + 1, 0).getDate();
  const dayPadded   = String(day).padStart(2, '0');
  const monthPadded = String(month + 1).padStart(2, '0');

  // Is this day in the future?
  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const thisDate  = new Date(year, month, day);
  const isFuture  = thisDate > todayDate;

  const fetchItems = useCallback(() => {
    setLoading(true); setAllItems(null);
    fetch(`/api/saldos-detalhes?tipo=${tipo}&mes=${month + 1}&ano=${year}`)
      .then(r => r.json())
      .then(json => setAllItems(json.success ? json.data : []))
      .catch(() => setAllItems([]))
      .finally(() => setLoading(false));
  }, [tipo, month, year]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const dayItems = (allItems || []).filter(item => parseInt((item.data || '').split('/')[0]) === day);
  const total    = dayItems.reduce((s, i) => s + i.valor, 0);
  const isForecast = isFuture && tipo === 'diarios' && dayItems.length === 0;
  const currentFilter = FILTER_OPTS.find(o => o.key === tipo);

  const handlePickType = (type) => {
    setShowTypePicker(false);
    setActiveModal(type);
    setModalKey(k => k + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <button onClick={onClose} className="p-1.5 text-gray-500 active:bg-gray-100 rounded-lg"><ChevronLeft size={22}/></button>
        <div className="flex items-center gap-1">
          <button onClick={() => setDay(d => d > 1 ? d - 1 : daysInM)} className="p-1.5 rounded-full text-gray-500 active:bg-gray-100"><ChevronLeft size={18}/></button>
          <span className="text-xl font-bold text-gray-800 min-w-[76px] text-center">{dayPadded}/{monthPadded}</span>
          <button onClick={() => setDay(d => d < daysInM ? d + 1 : 1)} className="p-1.5 rounded-full text-gray-500 active:bg-gray-100"><ChevronRight size={18}/></button>
        </div>
        <button onClick={() => setShowTypePicker(true)} className="p-1.5 text-gray-600 active:bg-gray-100 rounded-lg">
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1={12} y1={5} x2={12} y2={19}/><line x1={5} y1={12} x2={19} y2={12}/>
          </svg>
        </button>
      </div>

      {/* Type filter */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-100 flex-shrink-0">
        <button onClick={() => setShowFilter(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-gray-50 active:bg-gray-100">
          <TypeIconComp typeKey={tipo} size={22}/>
          <span className="text-sm font-medium text-gray-700">{currentFilter?.label}</span>
          <ChevronDown/>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading && <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Carregando...</div>}

        {/* Forecast placeholder for future diário days */}
        {!loading && isForecast && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FixedDailyIcon size={48}/>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600">Previsão diária</div>
              {diarioAlvo > 0 && (
                <div className="text-lg font-bold mt-1" style={{ color: TC.diarios }}>{fmtBRL(diarioAlvo)}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">Nenhuma transação registrada</div>
            </div>
          </div>
        )}

        {!loading && !isForecast && dayItems.length === 0 && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Nenhuma transação neste dia</div>
        )}
        {!loading && dayItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-gray-100">
            <TypeIconComp typeKey={tipo} size={36}/>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">{item.detalhes || item.descritivo || '–'}</div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span>{dayPadded}/{monthPadded}</span>
                <span>·</span>
                <span>{currentFilter?.label || item.descritivo}</span>
              </div>
            </div>
            <span className="text-sm font-bold whitespace-nowrap" style={{ color: TC[tipo] || '#374151' }}>{fmtBRL(item.valor)}</span>
          </div>
        ))}
      </div>

      {/* Total footer */}
      {!loading && total > 0 && (
        <div className="border-t border-gray-200 px-5 py-3.5 bg-white flex-shrink-0 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-500">Total do dia</span>
          <span className="text-base font-bold" style={{ color: TC[tipo] || '#374151' }}>{fmtBRL(total)}</span>
        </div>
      )}

      {showFilter && (
        <FilterSheet value={tipo} onChange={t => setTipo(t === 'todas' ? 'diarios' : t)} onClose={() => setShowFilter(false)} options={FILTER_OPTS_NO_ALL} zIndex={70}/>
      )}
      {showTypePicker && (
        <TypePickerSheet onClose={() => setShowTypePicker(false)} onPick={handlePickType}/>
      )}
      {activeModal && (
        <HiddenModalTrigger key={modalKey} type={activeModal}/>
      )}
    </div>
  );
}

// ─── Horizonte de Saldos ──────────────────────────────────────────────────────
function HorizonteView({ month, year, onClose }) {
  const [activeQ,    setActiveQ]    = useState(0);
  const [monthCache, setMonthCache] = useState({});
  const scrollRef = useRef(null);

  const qStart = Math.floor(month / 3) * 3;
  const quarters = Array.from({ length: 3 }, (_, q) =>
    Array.from({ length: 3 }, (_, m) => {
      const absM = qStart + q * 3 + m;
      const mo = absM % 12;
      const yr = year + Math.floor(absM / 12);
      return { month: mo, year: yr };
    })
  );
  const allMonths = quarters.flat();

  // Fetch all 9 months in parallel, storing full json
  useEffect(() => {
    Promise.all(
      allMonths.map(({ month: mo, year: yr }) =>
        fetch(`/api/saldos-mensal?mes=${mo + 1}&ano=${yr}`)
          .then(r => r.json())
          .then(json => ({ key: `${yr}-${mo}`, json }))
          .catch(() => ({ key: `${yr}-${mo}`, json: { success: false, data: [] } }))
      )
    ).then(results => {
      const raw = {};
      results.forEach(({ key, json }) => { raw[key] = json; });

      // Compute openingBalance for each month, anchored on current month
      const openings = {};
      const curKey   = `${year}-${month}`;
      const curJson  = raw[curKey];

      if (curJson?.success) {
        const saldoAtual = curJson.meta?.saldoAtual  || 0;
        const todayDay   = curJson.meta?.todayDay;
        const curDays    = curJson.data || [];
        const deltaToToday = todayDay != null
          ? curDays.filter(r => r.day <= todayDay).reduce((s, r) => s + dailyBalance(r), 0)
          : curDays.reduce((s, r) => s + dailyBalance(r), 0);
        openings[curKey] = saldoAtual - deltaToToday;
      }

      // Chain forward from current month
      for (let i = allMonths.findIndex(m => m.month === month && m.year === year) + 1; i < allMonths.length; i++) {
        const prev = allMonths[i - 1];
        const cur  = allMonths[i];
        const prevKey = `${prev.year}-${prev.month}`;
        const curK    = `${cur.year}-${cur.month}`;
        if (openings[prevKey] !== undefined) {
          const prevDays  = raw[prevKey]?.data || [];
          const prevTotal = prevDays.reduce((s, r) => s + dailyBalance(r), 0);
          openings[curK]  = openings[prevKey] + prevTotal;
        }
      }

      // Chain backward from current month
      const anchorIdx = allMonths.findIndex(m => m.month === month && m.year === year);
      for (let i = anchorIdx - 1; i >= 0; i--) {
        const next = allMonths[i + 1];
        const cur  = allMonths[i];
        const nextKey = `${next.year}-${next.month}`;
        const curK    = `${cur.year}-${cur.month}`;
        if (openings[nextKey] !== undefined) {
          const curDays  = raw[curK]?.data || [];
          const curTotal = curDays.reduce((s, r) => s + dailyBalance(r), 0);
          openings[curK] = openings[nextKey] - curTotal;
        }
      }

      // Build final cache: per-month array of { day, saldo }
      const cache = {};
      allMonths.forEach(({ month: mo, year: yr }) => {
        const k    = `${yr}-${mo}`;
        const days = raw[k]?.data || [];
        const ob   = openings[k] ?? 0;
        cache[k]   = days.map((row, idx) => {
          const cum = days.slice(0, idx + 1).reduce((s, r) => s + dailyBalance(r), 0);
          return { day: row.day, saldo: ob + cum };
        });
      });

      setMonthCache(cache);
    });
  }, [month, year]);

  const getMonthRows = (mo, yr) => monthCache[`${yr}-${mo}`] || [];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) setActiveQ(Math.round(scrollLeft / clientWidth));
  };

  return (
    <div className="fixed inset-0 z-[55] bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 bg-white flex-shrink-0">
        <button onClick={onClose} className="text-gray-600 p-1">
          <ChevronLeft size={22} />
        </button>
        <span className="font-semibold text-gray-800 text-base">Horizonte de Saldos</span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {quarters.map((qMonths, qi) => {
          const mData   = qMonths.map(m => ({ ...m, rows: getMonthRows(m.month, m.year) }));
          const maxDays = Math.max(...mData.map(m => new Date(m.year, m.month + 1, 0).getDate()));

          return (
            <div
              key={qi}
              className="flex-shrink-0 w-full overflow-y-auto"
              style={{ scrollSnapAlign: 'start' }}
            >
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    {mData.map((m, mi) => (
                      <th
                        key={mi}
                        colSpan={2}
                        className="text-center font-semibold py-2.5 text-gray-700 border-b border-gray-400 text-sm"
                        style={{ borderLeft: mi > 0 ? '2px solid #9ca3af' : undefined }}
                      >
                        {MONTHS[m.month]}/{String(m.year).slice(2)}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {mData.flatMap((_, mi) => [
                      <th
                        key={`dh${mi}`}
                        className="text-center text-gray-500 font-medium pb-2 text-xs bg-white"
                        style={{ width: '11%', borderLeft: mi > 0 ? '2px solid #9ca3af' : undefined }}
                      >
                        Dia
                      </th>,
                      <th
                        key={`vh${mi}`}
                        className="text-right text-gray-500 font-medium pb-2 text-xs pr-2 bg-white"
                        style={{ width: '22%' }}
                      >
                        Saldo
                      </th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: maxDays }, (_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #9ca3af' }}>
                      {mData.flatMap((m, mi) => {
                        const row = m.rows[i];
                        const bL  = mi > 0 ? '2px solid #9ca3af' : undefined;
                        if (!row) {
                          return [
                            <td key={`d${mi}`} className="py-1 text-center text-gray-300 text-xs" style={{ borderLeft: bL }}>–</td>,
                            <td key={`v${mi}`} className="py-1" />,
                          ];
                        }
                        const color = balColor(row.saldo);
                        return [
                          <td
                            key={`d${mi}`}
                            className="py-1.5 text-center text-xs"
                            style={{ color: '#111', backgroundColor: 'white', borderLeft: bL }}
                          >
                            {i + 1}
                          </td>,
                          <td
                            key={`v${mi}`}
                            className="py-1.5 text-right pr-2 text-xs"
                            style={{ color: '#111', backgroundColor: color + '50' }}
                          >
                            {fmtHorizonte(row.saldo)}
                          </td>,
                        ];
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 py-2.5 border-t border-gray-200 flex-shrink-0">
        {quarters.map((_, qi) => (
          <div
            key={qi}
            className="w-2 h-2 rounded-full transition-colors duration-200"
            style={{ background: qi === activeQ ? '#374151' : '#d1d5db' }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shared Tab Header ────────────────────────────────────────────────────────
function TabHeader({ month, year, today, onPrev, onNext, onOpenHorizonte }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-300 flex-shrink-0 gap-2">
      <div className="flex items-center gap-2">
        <Link href="/">
          <button className="p-1.5 rounded-lg text-gray-500 active:bg-gray-100" aria-label="Voltar ao início">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
              <polyline points="9 21 9 12 15 12 15 21"/>
            </svg>
          </button>
        </Link>
        <div className="text-gray-700">
          <CalendarIcon day={today.getDate()} size={34}/>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="p-1 rounded-full text-gray-500 active:bg-gray-100">
          <ChevronLeft size={18}/>
        </button>
        <span className="text-xl font-bold text-gray-800 min-w-[80px] text-center">
          {MONTHS[month]}/{year}
        </span>
        <button onClick={onNext} className="p-1 rounded-full text-gray-500 active:bg-gray-100">
          <ChevronRight size={18}/>
        </button>
      </div>
      <button onClick={onOpenHorizonte} className="p-1 rounded-lg active:bg-gray-100" aria-label="Horizonte de Saldos">
        <ColorGridIcon size={28}/>
      </button>
    </div>
  );
}

// ─── Saldos Table ─────────────────────────────────────────────────────────────
function SaldosTable({ data, filterType, month, year, useSaldo, onCellClick }) {
  const today    = new Date();
  const todayDay = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : null;
  const types    = filterType === 'todas' ? TYPE_KEYS : [filterType];
  const scrollRef = useRef(null);
  const todayRef  = useRef(null);

  // Scroll to today's row when data or filter changes
  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el        = todayRef.current;
      const offset    = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    }
  }, [data, filterType]);

  return (
    <div className="flex-1 overflow-y-auto" ref={scrollRef}>
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '44px' }}/>
          <col/>
          <col style={{ width: '112px' }}/>
        </colgroup>
        <tbody>
          {data.flatMap(row => {
            const balance = useSaldo ? row.saldo : dailyBalance(row);
            const rowSpan = types.length;
            const isToday = row.day === todayDay;

            return types.map((typeKey, ti) => {
              const value    = row[typeKey];
              const hasValue = value > 0;
              const isFirst  = ti === 0;
              const isLast   = ti === types.length - 1;

              return (
                <tr
                  key={`${row.day}-${ti}`}
                  ref={isFirst && isToday ? todayRef : undefined}
                  style={{ borderBottom: isLast ? '1px solid #9ca3af' : '1px solid #d1d5db' }}
                >
                  {isFirst && (
                    <td
                      rowSpan={rowSpan}
                      className="text-center align-top pt-2.5 text-base font-semibold"
                      style={{
                        borderRight:     '1px solid #9ca3af',
                        backgroundColor: isToday ? '#111827' : 'white',
                        color:           isToday ? 'white'   : '#374151',
                      }}
                    >
                      {row.day}
                    </td>
                  )}
                  <td
                    className="py-2 pl-2 pr-1"
                    onClick={() => onCellClick && onCellClick(row.day, typeKey)}
                    style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                  >
                    <div
                      className="flex items-center justify-between pr-1"
                      style={{ opacity: hasValue ? 1 : 0.3 }}
                    >
                      <TypeIconComp typeKey={typeKey} size={22}/>
                      <span className="text-sm" style={{ color: hasValue ? TC[typeKey] : '#9ca3af' }}>
                        {fmtBRL(value)}
                      </span>
                    </div>
                  </td>
                  {isFirst && (
                    <td
                      rowSpan={rowSpan}
                      className="text-right align-top pt-2.5 pr-3 text-sm"
                      style={{
                        borderLeft:      '1px solid #9ca3af',
                        backgroundColor: balBgColor(balance),
                        color:           '#111',
                      }}
                    >
                      {fmtBRL(balance)}
                    </td>
                  )}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Saldos Tab ───────────────────────────────────────────────────────────────
function SaldosTab({ month, year, today, onPrev, onNext, onOpenHorizonte, days, openingBalance, loading, onRefreshMonth, diarioAlvo }) {
  const [filterType, setFilterType] = useState('todas');
  const [showFilter, setShowFilter] = useState(false);
  const [dayDetail,  setDayDetail]  = useState(null); // { day, tipo }
  const currentFilter = FILTER_OPTS.find(o => o.key === filterType);

  // Running balance: saldo at end of day d = openingBalance + Σ dailyBalance(1..d)
  const computedDays = (days || []).map((row, idx) => {
    const cumulative = (days || []).slice(0, idx + 1).reduce((s, r) => s + dailyBalance(r), 0);
    return { ...row, saldo: (openingBalance || 0) + cumulative };
  });

  return (
    <div className="flex flex-col h-full">
      <TabHeader month={month} year={year} today={today} onPrev={onPrev} onNext={onNext} onOpenHorizonte={onOpenHorizonte}/>

      {/* ── Filter Bar / Column Headers ─────────────────────── */}
      <div className="flex items-center bg-white border-b flex-shrink-0" style={{ borderColor: '#9ca3af' }}>
        <div className="text-center text-xs font-semibold text-gray-500 py-3 flex-shrink-0" style={{ width: 44, borderRight: '1px solid #9ca3af' }}>
          Dia
        </div>
        <div className="flex-1 flex items-center py-2 px-2">
          <button
            onClick={() => setShowFilter(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-gray-50 active:bg-gray-100"
          >
            <TypeIconComp typeKey={filterType} size={24}/>
            <span className="text-sm font-medium text-gray-700">{currentFilter?.label}</span>
            <ChevronDown/>
          </button>
        </div>
        <div className="text-right text-xs font-semibold text-gray-500 py-3 pr-3 flex-shrink-0" style={{ width: 112, borderLeft: '1px solid #9ca3af' }}>
          Saldos
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
      ) : (
        <SaldosTable data={computedDays} filterType={filterType} month={month} year={year} useSaldo onCellClick={(day, tipo) => setDayDetail({ day, tipo })}/>
      )}

      {showFilter && (
        <FilterSheet value={filterType} onChange={setFilterType} onClose={() => setShowFilter(false)}/>
      )}

      {dayDetail && (
        <DayDetailSheet
          initialDay={dayDetail.day}
          month={month}
          year={year}
          initialTipo={dayDetail.tipo}
          onClose={() => setDayDetail(null)}
          onRefreshMonth={onRefreshMonth}
          diarioAlvo={diarioAlvo}
        />
      )}
    </div>
  );
}

// ─── Totais Tab ───────────────────────────────────────────────────────────────
function FormulaRow({ items }) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {items.map((item, i) => {
        if (item.type === 'op')       return <span key={i} className="text-xs text-gray-400 px-0.5">{item.label}</span>;
        if (item.key  === 'fixed')    return <FixedDailyIcon key={i} size={18}/>;
        return <TypeIconComp key={i} typeKey={item.key} size={18}/>;
      })}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="px-4 pt-4 pb-2 bg-gray-50 border-b border-gray-200">
      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── Detail Sheet ─────────────────────────────────────────────────────────────
function DetailSheet({ tipo, label, month, year, onClose }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const total = items ? items.reduce((s, i) => s + i.valor, 0) : 0;

  useEffect(() => {
    const mesNum = month + 1;
    fetch(`/api/saldos-detalhes?tipo=${tipo}&mes=${mesNum}&ano=${year}`)
      .then(r => r.json())
      .then(json => { if (json.success) setItems(json.data); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tipo, month, year]);

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <button onClick={onClose} className="text-gray-600 p-1">
          <ChevronLeft size={22}/>
        </button>
        <TypeIconComp typeKey={tipo} size={22}/>
        <span className="font-semibold text-gray-800">{label}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Carregando...</div>
        )}
        {!loading && items && items.length === 0 && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Nenhuma transação</div>
        )}
        {!loading && items && items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium text-gray-800 truncate">
                {item.detalhes || item.descritivo || '–'}
              </span>
              <span className="text-xs text-gray-400">{item.data}{item.conta ? ` · ${item.conta}` : ''}</span>
            </div>
            <span className="text-sm font-semibold ml-4 whitespace-nowrap" style={{ color: TC[tipo] || '#374151' }}>
              {fmtBRL(item.valor)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-5 py-4 bg-white flex-shrink-0 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">Total</span>
        <span className="text-base font-bold text-gray-900">{fmtBRL(total)}</span>
      </div>
    </div>
  );
}

function performanceStatus(val) {
  if (val > 0)  return { label: 'Sobrou dinheiro',   color: TC.economias };
  if (val === 0) return { label: 'Equilibrado',       color: TC.diarios };
  return { label: 'Déficit no mês', color: TC.despesas };
}
function economizadoStatus(pct) {
  if (pct >= 30) return { label: 'Acima do ideal',   color: TC.economias };
  if (pct >= 15) return { label: 'Na meta',           color: TC.economias };
  return { label: 'Abaixo do ideal', color: TC.despesas };
}
function custoVidaStatus(custo, receitas) {
  if (receitas === 0) return { label: '–', color: '#9ca3af' };
  if (custo < receitas) return { label: 'Dentro da renda', color: TC.economias };
  return { label: 'Acima da renda', color: TC.despesas };
}

function TotaisTab({ month, year, today, onPrev, onNext, onOpenHorizonte, totais, loading }) {
  const [detail, setDetail] = useState(null); // { tipo, label }

  const d = totais || {};
  const perf = performanceStatus(d.performance || 0);
  const econ = economizadoStatus(d.economizadoPct || 0);
  const cvSt = custoVidaStatus(d.custoVida || 0, d.receitas || 0);

  const MOVS_ROWS = [
    { key: 'receitas',  label: 'Entradas'          },
    { key: 'despesas',  label: 'Saídas'            },
    { key: 'diarios',   label: 'Diários'           },
    { key: 'economias', label: 'Economias'         },
    { key: 'cartao',    label: 'Gastos com cartão' },
  ];

  return (
    <div className="flex flex-col h-full">
      <TabHeader month={month} year={year} today={today} onPrev={onPrev} onNext={onNext} onOpenHorizonte={onOpenHorizonte}/>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Carregando...</div>
        ) : (
          <>
            <SectionLabel label="Cálculos do mês"/>

            {/* Performance */}
            <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">Performance</span>
                <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.performance || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <FormulaRow items={[
                  {type:'icon',key:'receitas'},{type:'op',label:'–'},{type:'icon',key:'despesas'},{type:'op',label:'–'},
                  {type:'icon',key:'diarios'},{type:'op',label:'–'},{type:'icon',key:'economias'},{type:'op',label:'–'},
                  {type:'icon',key:'cartao'},
                ]}/>
                <span className="text-xs ml-2 flex-shrink-0" style={{ color: perf.color }}>{perf.label}</span>
              </div>
            </div>

            {/* Economizado */}
            <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">Economizado</span>
                <span className="text-sm font-semibold text-gray-800">{d.economizadoPct || 0}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-1">
                  <TypeIconComp typeKey="economias" size={16}/>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.economizadoPct || 0)}%`, background: TC.economias }}/>
                  </div>
                  <TypeIconComp typeKey="receitas" size={16}/>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: econ.color }}>{econ.label}</span>
              </div>
            </div>

            {/* Custo de vida */}
            <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">Custo de vida</span>
                <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.custoVida || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <FormulaRow items={[
                  {type:'icon',key:'despesas'},{type:'op',label:'+'},
                  {type:'icon',key:'diarios'},{type:'op',label:'+'},
                  {type:'icon',key:'cartao'},
                ]}/>
                <span className="text-xs ml-2 flex-shrink-0" style={{ color: cvSt.color }}>{cvSt.label}</span>
              </div>
            </div>

            {/* Diário médio */}
            <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-800">Diário médio</span>
                <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.diarioMedio || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TypeIconComp typeKey="diarios" size={16}/>
                  <span className="text-xs text-gray-500">/{d.daysElapsed || 0} dias</span>
                </div>
                {d.diarioAlvo > 0 && (
                  <div className="flex items-center gap-1.5">
                    <FixedDailyIcon size={16}/>
                    <span className="text-xs text-gray-500">{fmtBRL(d.diarioAlvo)}</span>
                  </div>
                )}
              </div>
            </div>

            <SectionLabel label="Movimentações do mês"/>

            {MOVS_ROWS.map(row => (
              <button
                key={row.key}
                className="w-full px-4 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between active:bg-gray-50"
                onClick={() => setDetail({ tipo: row.key, label: row.label })}
              >
                <div className="flex items-center gap-3">
                  <TypeIconComp typeKey={row.key} size={24}/>
                  <span className="text-sm font-medium text-gray-800">{row.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-800">{fmtBRL(d[row.key] || 0)}</span>
                  <ChevronRight size={14}/>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      {detail && (
        <DetailSheet
          tipo={detail.tipo}
          label={detail.label}
          month={month}
          year={year}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

// ─── Diário Tab ───────────────────────────────────────────────────────────────
function DiarioTab({ month, year, today, onPrev, onNext, onOpenHorizonte, diarioAlvo }) {
  const [items,       setItems]   = useState(null);
  const [loadingG,    setLoadingG]= useState(true);
  const [daysElapsed, setDaysEl]  = useState(1);
  const [divisor,     setDivisor] = useState(1);

  useEffect(() => {
    setLoadingG(true);
    fetch('/api/saldos-diario-global')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setItems(json.data);
          setDaysEl(json.daysElapsed || 1);
          setDivisor(json.daysElapsed || 1);
        } else setItems([]);
      })
      .catch(() => setItems([]))
      .finally(() => setLoadingG(false));
  }, []); // fetch once — all-time data

  const allItems = items || [];
  const total    = allItems.reduce((s, i) => s + i.valor, 0);
  const result   = divisor > 0 ? total / divisor : 0;

  const cycleDivisor = () => {
    setDivisor(d => {
      if (d === daysElapsed) return 30;
      if (d === 30)          return 31;
      return daysElapsed;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <TabHeader month={month} year={year} today={today} onPrev={onPrev} onNext={onNext} onOpenHorizonte={onOpenHorizonte}/>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loadingG ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Carregando...</div>
        ) : allItems.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Sem transações diárias</div>
        ) : (
          allItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
              <span className="text-sm text-gray-800">{fmtBRL(item.valor)}</span>
            </div>
          ))
        )}
        <div className="bg-gray-100 flex-1" style={{ minHeight: 80 }}/>
      </div>

      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Total acumulado</span>
          <span className="text-sm text-gray-800">{fmtBRL(total)}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Dividido por</span>
          <button className="flex items-center gap-1.5 text-sm text-gray-800" onClick={cycleDivisor}>
            {divisor} dias
            <ChevronDown/>
          </button>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          {diarioAlvo > 0 && (
            <div className="flex items-center gap-1.5">
              <FixedDailyIcon size={16}/>
              <span className="text-xs text-gray-400">Alvo {fmtBRL(diarioAlvo)}</span>
            </div>
          )}
          <span className="text-xl font-bold text-gray-900 ml-auto">{fmtBRL(result)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const TABS = [
  { key: 'saldos', label: 'Saldos', Icon: TableIcon   },
  { key: 'totais', label: 'Totais', Icon: TotaisIcon  },
  { key: 'diario', label: 'Diário', Icon: DiarioIcon  },
];

function BottomNav({ active, onChange }) {
  return (
    <nav
      className="flex items-end justify-around bg-white border-t border-gray-200 flex-shrink-0"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}
    >
      {TABS.map(tab => {
        const isActive = active === tab.key;
        const { Icon } = tab;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-6 relative"
          >
            {isActive && (
              <div
                className="absolute top-0 left-[15%] right-[15%] h-0.5 rounded-full"
                style={{ background: ACTIVE_COLOR }}
              />
            )}
            <span style={{ color: isActive ? ACTIVE_COLOR : '#9ca3af' }}>
              <Icon/>
            </span>
            <span className="text-xs font-medium" style={{ color: isActive ? ACTIVE_COLOR : '#9ca3af' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SaldosPage() {
  const today = new Date();
  const [activeTab,     setActiveTab]     = useState('saldos');
  const [month,         setMonth]         = useState(today.getMonth());
  const [year,          setYear]          = useState(today.getFullYear());
  const [showHorizonte, setShowHorizonte] = useState(false);

  // ─── Data cache: key = "YYYY-M" → { ...apiJson, openingBalance } ──────────
  const [dataCache,  setDataCache]  = useState({});
  const [loading,    setLoading]    = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const dataCacheRef = useRef({});
  // Keep ref in sync so the fetch callback always sees the latest cache
  useEffect(() => { dataCacheRef.current = dataCache; }, [dataCache]);

  const monthKey = `${year}-${month + 1}`;

  // Call this to invalidate + re-fetch current month (e.g. after adding a transaction)
  const refreshMonth = useCallback(() => {
    setDataCache(prev => { const n = { ...prev }; delete n[monthKey]; return n; });
    setRefreshKey(k => k + 1);
  }, [monthKey]);

  const fetchData = useCallback(() => {
    // Already cached → nothing to do
    if (dataCacheRef.current[monthKey]) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/saldos-mensal?mes=${month + 1}&ano=${year}`) // refreshKey in deps forces re-run after invalidate
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const days      = json.data || [];
        const saldoAtual = json.meta?.saldoAtual || 0;
        const todayDay   = json.meta?.todayDay;
        const cache      = dataCacheRef.current;

        let openingBalance;
        if (todayDay !== null && todayDay !== undefined) {
          // Current month: anchor on saldoAtual and work backwards to day 1
          const deltaToToday = days
            .filter(r => r.day <= todayDay)
            .reduce((s, r) => s + dailyBalance(r), 0);
          openingBalance = saldoAtual - deltaToToday;
        } else {
          // Non-current month: derive from an adjacent already-loaded month
          const prevDate = new Date(year, month - 1, 1);
          const nextDate = new Date(year, month + 1, 1);
          const prevKey  = `${prevDate.getFullYear()}-${prevDate.getMonth() + 1}`;
          const nextKey  = `${nextDate.getFullYear()}-${nextDate.getMonth() + 1}`;

          if (cache[nextKey]?.openingBalance !== undefined) {
            // openingBalance(M) = openingBalance(M+1) − Σ(M's daily deltas)
            const myTotal = days.reduce((s, r) => s + dailyBalance(r), 0);
            openingBalance = cache[nextKey].openingBalance - myTotal;
          } else if (cache[prevKey]?.openingBalance !== undefined) {
            // openingBalance(M) = openingBalance(M−1) + Σ(M−1's daily deltas)
            const prevEntry = cache[prevKey];
            const prevTotal = (prevEntry.data || []).reduce((s, r) => s + dailyBalance(r), 0);
            openingBalance = prevEntry.openingBalance + prevTotal;
          } else {
            // No adjacent month loaded yet — use saldoAtual as rough anchor
            openingBalance = saldoAtual;
          }
        }

        setDataCache(prev => ({ ...prev, [monthKey]: { ...json, openingBalance } }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year, monthKey, refreshKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Navigation ──────────────────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const hProps = { month, year, today, onPrev: prevMonth, onNext: nextMonth, onOpenHorizonte: () => setShowHorizonte(true) };
  const entry        = dataCache[monthKey];
  const days         = entry?.data         || [];
  const totais       = entry?.totais       || {};
  const diarioItems  = entry?.diarioItems  || [];
  const openingBalance = entry?.openingBalance ?? 0;
  const diarioAlvo   = entry?.meta?.diarioDefault || 0;

  return (
    <>
      <title>Saldos – CF</title>
      <div className="fixed inset-0 z-40 bg-white flex flex-col" style={{ fontFamily: 'inherit' }}>
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'saldos' && (
            <SaldosTab {...hProps} days={days} openingBalance={openingBalance} loading={loading} onRefreshMonth={refreshMonth} diarioAlvo={diarioAlvo}/>
          )}
          {activeTab === 'totais' && (
            <TotaisTab {...hProps} totais={totais} loading={loading}/>
          )}
          {activeTab === 'diario' && (
            <DiarioTab {...hProps} diarioAlvo={diarioAlvo}/>
          )}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab}/>
      </div>
      {showHorizonte && (
        <HorizonteView month={month} year={year} onClose={() => setShowHorizonte(false)}/>
      )}
    </>
  );
}
