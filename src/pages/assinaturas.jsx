import React, { useEffect, useState } from 'react';
import { MdAutorenew } from 'react-icons/md';
import { BsCreditCard2Front } from 'react-icons/bs';
import { AiOutlineCalendar } from 'react-icons/ai';

function parseBRL(str) {
  if (!str) return 0;
  return parseFloat(
    str.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  ) || 0;
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const CARD_COLORS = {
  'nubank caio': { bg: '#f3f0ff', border: '#7c3aed', text: '#7c3aed', dot: '#7c3aed' },
  'nubank julia': { bg: '#fff0f6', border: '#db2777', text: '#db2777', dot: '#db2777' },
};

function getCardStyle(cartao) {
  const key = (cartao || '').toLowerCase().trim();
  return CARD_COLORS[key] || { bg: '#f3f4f6', border: '#6b7280', text: '#374151', dot: '#6b7280' };
}

function SubscriptionCard({ sub }) {
  const valor = parseBRL(sub.valor);
  const style = getCardStyle(sub.cartão || sub['cartão'] || sub.cartao);
  const mes = (sub['mês'] || sub.mes || '').toLowerCase().includes('anterior') ? 'Mês anterior' : 'Mês atual';

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3 shadow-sm border"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-xl"
            style={{ background: style.border + '22' }}
          >
            <MdAutorenew size={20} style={{ color: style.text }} />
          </div>
          <span className="font-semibold text-gray-800 text-sm leading-tight">{sub.assinatura}</span>
        </div>
        <span className="text-base font-bold whitespace-nowrap" style={{ color: style.text }}>
          {formatBRL(valor)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <AiOutlineCalendar size={13} />
          <span>Dia <strong className="text-gray-700">{sub.dia}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <AiOutlineCalendar size={13} />
          <span>Fat. dia <strong className="text-gray-700">{sub['dia fatura'] || sub.diafatura || sub['dia_fatura'] || '–'}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <BsCreditCard2Front size={13} />
          <span style={{ color: style.text }} className="font-medium">{sub.cartão || sub['cartão'] || sub.cartao}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: style.border + '22', color: style.text }}
        >
          {mes}
        </span>
      </div>
    </div>
  );
}

function TotaisSection({ assinaturas }) {
  const total = assinaturas.reduce((acc, s) => acc + parseBRL(s.valor), 0);

  const porCartao = {};
  assinaturas.forEach(s => {
    const c = s.cartão || s['cartão'] || s.cartao || 'Outros';
    if (!porCartao[c]) porCartao[c] = 0;
    porCartao[c] += parseBRL(s.valor);
  });

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
        <MdAutorenew size={18} className="text-purple-600" />
        Resumo
      </h2>

      <div className="flex flex-col gap-2">
        {Object.entries(porCartao).sort().map(([cartao, val]) => {
          const style = getCardStyle(cartao);
          return (
            <div key={cartao} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                  style={{ background: style.dot }}
                />
                <span className="text-sm text-gray-600">{cartao}</span>
              </div>
              <span className="text-sm font-semibold" style={{ color: style.text }}>
                {formatBRL(val)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span className="font-bold text-gray-700">Total</span>
        <span className="font-bold text-lg text-gray-900">{formatBRL(total)}</span>
      </div>
    </div>
  );
}

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/assinaturas')
      .then(r => r.json())
      .then(json => {
        if (json.success) setAssinaturas(json.data);
        else setError(json.error || 'Erro ao carregar assinaturas');
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen pb-10">
      <title>Assinaturas – CF</title>
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MdAutorenew size={26} className="text-purple-600" />
          Assinaturas
        </h1>

        {loading && (
          <div className="text-center py-20 text-gray-400 text-sm">Carregando...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-6">
            <TotaisSection assinaturas={assinaturas} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assinaturas.filter(s => s.assinatura).map((sub, i) => (
                <SubscriptionCard key={i} sub={sub} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
