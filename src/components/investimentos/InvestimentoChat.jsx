import React, { useState, useRef, useEffect } from 'react';
import { BsRobot, BsSendFill } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi';

function inlineMd(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
    }
    return p || null;
  });
}

function renderMarkdown(text) {
  const lines = text.split('\n');
  const result = [];
  let listItems = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length) {
      result.push(
        <ul key={`ul${key++}`} className="my-1.5 space-y-0.5">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bullet = line.match(/^(\s*)[*+-]\s+(.*)$/);
    if (bullet) {
      const indent = bullet[1].length > 0;
      listItems.push(
        <li key={key++} className={`flex gap-1.5${indent ? ' ml-4' : ''}`}>
          <span className="text-purple-500 shrink-0 mt-0.5">•</span>
          <span>{inlineMd(bullet[2])}</span>
        </li>
      );
    } else {
      flushList();
      if (line.trim() === '') {
        if (result.length) result.push(<div key={key++} className="h-1" />);
      } else {
        result.push(<p key={key++} className="leading-snug">{inlineMd(line)}</p>);
      }
    }
  }
  flushList();
  return result;
}

const SUGGESTIONS = [
  'Como está a diversificação da minha carteira?',
  'Quais ativos estão com maior ganho?',
  'Vale a pena adicionar mais FIIs agora?',
  'Analise minha reserva de emergência',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
          <BsRobot size={14} className="text-purple-700" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${isUser
            ? 'bg-purple-800 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
          }`}
      >
        {isUser ? msg.content : renderMarkdown(msg.content)}
      </div>
    </div>
  );
}

const InvestimentoChat = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const send = async (text) => {
    const message = text?.trim() || input.trim();
    if (!message || loading) return;

    const userMsg = { role: 'user', content: message };
    setHistory((h) => [...h, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/investimentos/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      const json = await res.json();
      if (json.success) {
        setHistory((h) => [...h, { role: 'assistant', content: json.reply }]);
      } else {
        setError(json.error || 'Erro na resposta');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="bg-white rounded-lg border flex flex-col" style={{ height: 480 }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <HiSparkles size={18} className="text-purple-600" />
        <h2 className="font-bold text-gray-700 text-sm">Assistente de Investimentos</h2>
        <span className="ml-auto text-xs text-gray-400">Llama 3.3 70B · contexto da carteira</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center pt-4">
              Pergunte sobre sua carteira, ativos específicos ou estratégias de investimento.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-3 py-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-700
                             border border-gray-200 rounded-lg transition-colors text-gray-600"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <BsRobot size={14} className="text-purple-700" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-xs text-red-500">{error}</p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Pergunte sobre sua carteira ou qualquer ativo..."
          rows={1}
          className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2
                     focus:outline-none focus:border-purple-400 transition-colors"
          style={{ maxHeight: 80 }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="bg-purple-800 text-white rounded-xl px-3 py-2 hover:bg-purple-700
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <BsSendFill size={15} />
        </button>
      </div>
    </div>
  );
};

export default InvestimentoChat;
