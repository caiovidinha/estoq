import { useState, useRef } from 'react';

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

const TOTAIS_MOCK = {
  performance:        9945.90,
  performanceStatus:  'Sobrou dinheiro',
  economizado:        55,
  economizadoStatus:  'Acima do ideal',
  custoVida:          2948.81,
  custoVidaStatus:    'Dentro da renda',
  diarioMedio:        19.47,
  diarioDias:         14,
  diarioAlvo:         160.00,
  entradas:           28519.16,
  saidas:             116.19,
  diarios:            272.62,
  economias:          15624.45,
  cartao:             0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function seededRand(n) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function mockMonth(month, year) {
  const days = daysInMonth(month, year);
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    const s = month * 37 + d * 7 + year * 13;
    return {
      day:       d,
      receitas:  seededRand(s)      > 0.55 ? Math.round(seededRand(s * 3)  * 4000 + 200) : 0,
      despesas:  seededRand(s * 2)  > 0.45 ? Math.round(seededRand(s * 5)  * 1500 + 100) : 0,
      diarios:   seededRand(s * 4)  > 0.60 ? Math.round(seededRand(s * 7)  * 600  + 30)  : 0,
      economias: seededRand(s * 6)  > 0.70 ? Math.round(seededRand(s * 11) * 2000 + 100) : 0,
      cartao:    seededRand(s * 8)  > 0.50 ? Math.round(seededRand(s * 13) * 1200 + 80)  : 0,
    };
  });
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
function FilterSheet({ value, onChange, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div className="flex-1" onClick={onClose} />
      <div className="bg-white rounded-t-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-sm font-semibold text-gray-800">Mostrar</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>

        {FILTER_OPTS.map((opt, idx) => (
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
            {idx < FILTER_OPTS.length - 1 && (
              <div className="mx-5 h-px bg-gray-100" />
            )}
          </div>
        ))}
        <div style={{ height: 'max(env(safe-area-inset-bottom), 16px)' }} />
      </div>
    </div>
  );
}

// ─── Horizonte de Saldos ──────────────────────────────────────────────────────
function HorizonteView({ month, year, onClose }) {
  const [activeQ, setActiveQ] = useState(0);
  const scrollRef = useRef(null);

  const qStart = Math.floor(month / 3) * 3;
  const quarters = Array.from({ length: 3 }, (_, q) =>
    Array.from({ length: 3 }, (_, m) => {
      const absM = qStart + q * 3 + m;
      const mo = absM % 12;
      const yr = year + Math.floor(absM / 12);
      return { month: mo, year: yr, data: mockMonth(mo, yr) };
    })
  );

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

      {/* Horizontal quarterly snap */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {quarters.map((qMonths, qi) => {
          const maxDays = Math.max(...qMonths.map(m => m.data.length));
          return (
            <div
              key={qi}
              className="flex-shrink-0 w-full overflow-y-auto"
              style={{ scrollSnapAlign: 'start' }}
            >
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    {qMonths.map((m, mi) => (
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
                    {qMonths.flatMap((_, mi) => [
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
                      {qMonths.flatMap((m, mi) => {
                        const row  = m.data[i];
                        const bL   = mi > 0 ? '2px solid #9ca3af' : undefined;
                        if (!row) {
                          return [
                            <td key={`d${mi}`} className="py-1 text-center text-gray-300 text-xs" style={{ borderLeft: bL }}>–</td>,
                            <td key={`v${mi}`} className="py-1" />,
                          ];
                        }
                        const bal   = dailyBalance(row);
                        const color = balColor(bal);
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
                            {fmtHorizonte(bal)}
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

      {/* Quarter indicator dots */}
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
      <div className="text-gray-700">
        <CalendarIcon day={today.getDate()} size={34}/>
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
function SaldosTable({ data, filterType, month, year }) {
  const today    = new Date();
  const todayDay = (today.getFullYear() === year && today.getMonth() === month) ? today.getDate() : null;
  const types    = filterType === 'todas' ? TYPE_KEYS : [filterType];

  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '44px' }}/>
          <col/>
          <col style={{ width: '112px' }}/>
        </colgroup>
        <tbody>
          {data.flatMap(row => {
            const balance = dailyBalance(row);
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
                  <td className="py-2 pl-2 pr-1">
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
function SaldosTab({ month, year, today, onPrev, onNext, onOpenHorizonte }) {
  const [filterType, setFilterType] = useState('todas');
  const [showFilter, setShowFilter] = useState(false);
  const data          = mockMonth(month, year);
  const currentFilter = FILTER_OPTS.find(o => o.key === filterType);

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

      <SaldosTable data={data} filterType={filterType} month={month} year={year}/>

      {showFilter && (
        <FilterSheet value={filterType} onChange={setFilterType} onClose={() => setShowFilter(false)}/>
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

function TotaisTab({ month, year, today, onPrev, onNext, onOpenHorizonte }) {
  const d = TOTAIS_MOCK;
  return (
    <div className="flex flex-col h-full">
      <TabHeader month={month} year={year} today={today} onPrev={onPrev} onNext={onNext} onOpenHorizonte={onOpenHorizonte}/>
      <div className="flex-1 overflow-y-auto">
        <SectionLabel label="Cálculos do mês"/>

        {/* Performance */}
        <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-800">Performance</span>
            <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.performance)}</span>
          </div>
          <div className="flex items-center justify-between">
            <FormulaRow items={[
              {type:'icon',key:'receitas'},{type:'op',label:'–'},{type:'icon',key:'despesas'},{type:'op',label:'–'},
              {type:'icon',key:'diarios'},{type:'op',label:'–'},{type:'icon',key:'economias'},{type:'op',label:'–'},
              {type:'icon',key:'cartao'},{type:'op',label:'–'},{type:'icon',key:'fixed'},
            ]}/>
            <span className="text-xs ml-2 flex-shrink-0" style={{ color: TC.economias }}>{d.performanceStatus}</span>
          </div>
        </div>

        {/* Economizado */}
        <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-800">Economizado</span>
            <span className="text-sm font-semibold text-gray-800">{d.economizado}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <TypeIconComp typeKey="economias" size={16}/>
              <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.economizado)}%`, background: TC.economias }}/>
              </div>
              <TypeIconComp typeKey="receitas" size={16}/>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: TC.economias }}>{d.economizadoStatus}</span>
          </div>
        </div>

        {/* Custo de vida */}
        <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-800">Custo de vida</span>
            <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.custoVida)}</span>
          </div>
          <div className="flex items-center justify-between">
            <FormulaRow items={[
              {type:'icon',key:'despesas'},{type:'op',label:'+'},
              {type:'icon',key:'diarios'},{type:'op',label:'+'},
              {type:'icon',key:'cartao'},{type:'op',label:'+'},
              {type:'icon',key:'fixed'},
            ]}/>
            <span className="text-xs ml-2 flex-shrink-0" style={{ color: TC.economias }}>{d.custoVidaStatus}</span>
          </div>
        </div>

        {/* Diário médio */}
        <div className="px-4 py-3.5 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-sm font-semibold text-gray-800">Diário médio</span>
            <span className="text-sm font-semibold text-gray-800">{fmtBRL(d.diarioMedio)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TypeIconComp typeKey="diarios" size={16}/>
              <span className="text-xs text-gray-500">/{d.diarioDias}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FixedDailyIcon size={16}/>
              <span className="text-xs text-gray-500">{fmtBRL(d.diarioAlvo)}</span>
            </div>
          </div>
        </div>

        <SectionLabel label="Movimentações do mês"/>

        {[
          { key: 'receitas',  label: 'Entradas',          val: d.entradas  },
          { key: 'despesas',  label: 'Saídas',            val: d.saidas    },
          { key: 'diarios',   label: 'Diários',           val: d.diarios   },
          { key: 'economias', label: 'Economias',         val: d.economias },
          { key: 'cartao',    label: 'Gastos com cartão', val: d.cartao    },
        ].map(row => (
          <div key={row.key} className="px-4 py-3.5 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TypeIconComp typeKey={row.key} size={24}/>
              <span className="text-sm font-medium text-gray-800">{row.label}</span>
            </div>
            <span className="text-sm text-gray-800">{fmtBRL(row.val)}</span>
          </div>
        ))}

        <div className="px-4 py-3.5 bg-white flex items-center gap-3">
          <GrayGridCircles size={24}/>
          <span className="text-sm font-medium text-gray-500">Ver todas</span>
        </div>
      </div>
    </div>
  );
}

// ─── Diário Tab ───────────────────────────────────────────────────────────────
const DIARIO_MOCK = {
  items: [
    { label: 'Comida',     valor: 2500.00 },
    { label: 'Transporte', valor: 800.00  },
    { label: 'Lazer',      valor: 1000.00 },
    { label: 'Compras',    valor: 300.00  },
    { label: 'Saúde',      valor: 200.00  },
  ],
  divisor: 30,
};

function DiarioTab({ month, year, today, onPrev, onNext, onOpenHorizonte }) {
  const [divisor, setDivisor] = useState(DIARIO_MOCK.divisor);
  const total  = DIARIO_MOCK.items.reduce((s, i) => s + i.valor, 0);
  const result = total / divisor;

  return (
    <div className="flex flex-col h-full">
      <TabHeader month={month} year={year} today={today} onPrev={onPrev} onNext={onNext} onOpenHorizonte={onOpenHorizonte}/>

      {/* List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {DIARIO_MOCK.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            <span className="text-sm text-gray-800">{fmtBRL(item.valor)}</span>
          </div>
        ))}
        {/* Empty space area below items (matches screenshot) */}
        <div className="bg-gray-100 flex-1" style={{ minHeight: 80 }}/>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Total mensal</span>
          <span className="text-sm text-gray-800">{fmtBRL(total)}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Dividido por</span>
          <button
            className="flex items-center gap-1.5 text-sm text-gray-800"
            onClick={() => setDivisor(d => d === 30 ? 31 : d === 31 ? 28 : 30)}
          >
            {divisor} dias
            <ChevronDown/>
          </button>
        </div>
        <div className="flex items-center justify-end px-5 py-4">
          <span className="text-xl font-bold text-gray-900">{fmtBRL(result)}</span>
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

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const hProps = { month, year, today, onPrev: prevMonth, onNext: nextMonth, onOpenHorizonte: () => setShowHorizonte(true) };

  return (
    <>
      <title>Saldos – CF</title>
      <div className="fixed inset-0 z-40 bg-white flex flex-col" style={{ fontFamily: 'inherit' }}>
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'saldos' && <SaldosTab {...hProps}/>}
          {activeTab === 'totais' && <TotaisTab {...hProps}/>}
          {activeTab === 'diario' && <DiarioTab {...hProps}/>}
        </div>
        <BottomNav active={activeTab} onChange={setActiveTab}/>
      </div>
      {showHorizonte && (
        <HorizonteView month={month} year={year} onClose={() => setShowHorizonte(false)}/>
      )}
    </>
  );
}
