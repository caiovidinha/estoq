/**
 * POST /api/ai/categorize
 * Usa GPT-4o-mini para categorizar uma lista de transações bancárias
 * dentro das categorias e padrões de uso do app.
 *
 * Body: { transactions: [{ description, amount, date }] }
 *
 * Resposta: { results: [{ descritivo, detalhes, tipo }] }
 * - descritivo: categoria exata (deve estar na lista de categorias)
 * - detalhes:   nome do estabelecimento legível (ex: "Supermercado Extra")
 * - tipo:       "DESPESA" | "RECEITA"
 */

const CATEGORIAS_DESPESA = [
  'Alimentação',
  'Locomoção',
  'Academia',
  'Celular',
  'Vestuário',
  'Cartão',
  'Dívida',
  'Lazer',
  'Saúde',
  'Bet',
  'Presente',
  'Serviços',
  'Investimento',
  'Fatura',
  'Outros',
];

const CATEGORIAS_RECEITA = [
  'Salário - V4',
  'Freelance',
  'Investimento',
  'Limite Cartão',
  'Outros',
];

const SYSTEM_PROMPT = `
Você é um assistente de finanças pessoais brasileiro.
Sua tarefa é categorizar transações bancárias do Nubank.

Categorias de DESPESA disponíveis:
${CATEGORIAS_DESPESA.join(', ')}

Categorias de RECEITA disponíveis:
${CATEGORIAS_RECEITA.join(', ')}

Regras:
- "tipo" deve ser "DESPESA" se type="DEBIT", "RECEITA" se type="CREDIT".
- "descritivo" deve ser EXATAMENTE uma das categorias listadas acima. Não invente categorias novas.
- "detalhes" deve ser o nome do estabelecimento/descrição de forma legível e concisa em português (máximo 40 caracteres). Ex: "Supermercado Extra", "Uber", "Netflix", "Farmácia Droga Raia".
- Se não souber o estabelecimento com certeza, use a descrição original limpa.
- Transações de débito automático, fatura de cartão → categoria "Fatura".
- PIX recebido de pessoa física → "Outros" com detalhes sendo o nome da pessoa se disponível.
- Responda APENAS com um array JSON válido, sem markdown, sem explicações.

Formato de resposta:
[{"descritivo":"Alimentação","detalhes":"iFood","tipo":"DESPESA"}, ...]
`.trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { transactions } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: 'transactions é obrigatório e deve ser um array' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY não configurada' });
  }

  // Limite de segurança: processa no máximo 50 transações por chamada
  const batch = transactions.slice(0, 50);

  const userMessage = batch
    .map((tx, i) => `${i + 1}. description="${tx.description}" type=${tx.type} amount=${tx.amount} date="${tx.date}"`)
    .join('\n');

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const raw = openaiData.choices?.[0]?.message?.content || '[]';

    // O modelo pode retornar {"results":[...]} ou [...] diretamente
    let parsed;
    try {
      const obj = JSON.parse(raw);
      parsed = Array.isArray(obj) ? obj : (obj.results || obj.transactions || Object.values(obj)[0] || []);
    } catch {
      throw new Error('Resposta inválida da OpenAI: ' + raw);
    }

    // Valida e sanitiza cada resultado
    const results = batch.map((_, i) => {
      const suggestion = parsed[i] || {};
      const tipo = suggestion.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA';
      const categorias = tipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
      const descritivo = categorias.includes(suggestion.descritivo)
        ? suggestion.descritivo
        : 'Outros';
      const detalhes = (suggestion.detalhes || '').slice(0, 60);
      return { descritivo, detalhes, tipo };
    });

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Erro ao categorizar com IA:', error);
    return res.status(500).json({ error: error.message });
  }
}
