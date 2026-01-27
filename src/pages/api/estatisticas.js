import { getRange, parseSheetData } from '@/lib/sheets';

/**
 * API Route: GET /api/estatisticas
 * Retorna estatísticas de gastos e receitas com filtros dinâmicos
 * 
 * Query params:
 * - periodo: "semana" | "mes" | "ano" | "personalizado"
 * - dataInicio: "DD/MM/YYYY" (obrigatório se periodo=personalizado)
 * - dataFim: "DD/MM/YYYY" (obrigatório se periodo=personalizado)
 * - agrupar: "geral" | "categoria"
 */

// Função para converter data DD/MM/YYYY para objeto Date
function parseDate(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

// Função para obter o primeiro dia da semana (segunda-feira)
function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajusta para segunda-feira
  return new Date(d.setDate(diff));
}

// Função para obter o último dia da semana (domingo)
function getEndOfWeek(date = new Date()) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

// Função para verificar se uma data está no período
function isDateInPeriod(dateStr, periodo, dataInicio, dataFim) {
  const date = parseDate(dateStr);
  if (!date) return false;

  const now = new Date();

  switch (periodo) {
    case 'semana':
      const weekStart = getStartOfWeek(now);
      const weekEnd = getEndOfWeek(now);
      return date >= weekStart && date <= weekEnd;

    case 'mes':
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    case 'ano':
      return date.getFullYear() === now.getFullYear();

    case 'personalizado':
      if (!dataInicio || !dataFim) return false;
      const start = parseDate(dataInicio);
      const end = parseDate(dataFim);
      return date >= start && date <= end;

    default:
      return false;
  }
}

// Função para calcular dias no período
function getDaysInPeriod(periodo, dataInicio, dataFim) {
  const now = new Date();

  switch (periodo) {
    case 'semana':
      return 7;

    case 'mes':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    case 'ano':
      return 365;

    case 'personalizado':
      if (!dataInicio || !dataFim) return 30;
      const start = parseDate(dataInicio);
      const end = parseDate(dataFim);
      const diff = Math.abs(end - start);
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;

    default:
      return 30;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { periodo = 'mes', dataInicio, dataFim, agrupar = 'geral' } = req.query;

    // Validação para período personalizado
    if (periodo === 'personalizado' && (!dataInicio || !dataFim)) {
      return res.status(400).json({
        success: false,
        error: 'Para período personalizado, dataInicio e dataFim são obrigatórios',
      });
    }

    // Buscar dados de Extrato (transações de débito)
    const rawDataDebito = await getRange('Extrato!A:H');
    const movimentacoesDebito = parseSheetData(rawDataDebito);

    // Buscar dados de Crédito (transações de crédito)
    const rawDataCredito = await getRange('Extrato Crédito!A:H');
    const movimentacoesCredito = parseSheetData(rawDataCredito);

    const todasMovimentacoes = [...movimentacoesDebito, ...movimentacoesCredito];

    // Filtrar apenas transações pagas/recebidas (sem filtro de período para as médias)
    const transacoesPagas = todasMovimentacoes.filter(mov => {
      const situacaoUpper = mov['situação']?.toUpperCase() || '';
      return situacaoUpper === 'PAGO' || 
             situacaoUpper === 'PAGA' || 
             situacaoUpper === 'RECEBIDO' || 
             situacaoUpper === 'RECEBIDA';
    });

    console.log('Transações pagas/recebidas:', transacoesPagas.length);

    // Filtrar transações do período selecionado (para os totais)
    const transacoesPeriodo = transacoesPagas.filter(mov => {
      return isDateInPeriod(mov.data, periodo, dataInicio, dataFim);
    });

    console.log('Transações do período:', transacoesPeriodo.length);

    console.log('Transações do período:', transacoesPeriodo.length);

    // Calcular estatísticas GERAIS (todas as transações pagas) para as médias
    let despesasGerais = 0;
    let receitasGerais = 0;
    const datasUnicas = new Set();

    transacoesPagas.forEach(mov => {
      const valor = parseFloat(
        mov.valor
          ?.toString()
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .replace('-', '')
          .trim() || '0'
      );

      if (mov.tipo?.toUpperCase() === 'DESPESA') {
        despesasGerais += valor;
      } else if (mov.tipo?.toUpperCase() === 'RECEITA') {
        receitasGerais += valor;
      }

      // Adicionar data única para calcular período total
      if (mov.data) {
        datasUnicas.add(mov.data);
      }
    });

    // Calcular período total (da primeira à última transação)
    let diasTotais = 30; // Padrão
    let semanasTotais = 4;
    let mesesTotais = 1;

    if (datasUnicas.size > 0) {
      const datas = Array.from(datasUnicas).map(d => parseDate(d)).filter(d => d);
      if (datas.length > 0) {
        const dataMin = new Date(Math.min(...datas));
        const dataMax = new Date(Math.max(...datas));
        const diffMs = dataMax - dataMin;
        diasTotais = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        semanasTotais = diasTotais / 7;
        mesesTotais = diasTotais / 30;
      }
    }

    // Calcular totais do período selecionado
    let despesasPeriodo = 0;
    let receitasPeriodo = 0;
    const categorias = {};

    transacoesPeriodo.forEach(mov => {
      const valor = parseFloat(
        mov.valor
          ?.toString()
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .replace('-', '')
          .trim() || '0'
      );

      if (mov.tipo?.toUpperCase() === 'DESPESA') {
        despesasPeriodo += valor;

        if (agrupar === 'categoria') {
          if (!categorias[mov.descritivo]) {
            categorias[mov.descritivo] = { despesas: 0, receitas: 0, total: 0 };
          }
          categorias[mov.descritivo].despesas += valor;
          categorias[mov.descritivo].total -= valor;
        }
      } else if (mov.tipo?.toUpperCase() === 'RECEITA') {
        receitasPeriodo += valor;

        if (agrupar === 'categoria') {
          if (!categorias[mov.descritivo]) {
            categorias[mov.descritivo] = { despesas: 0, receitas: 0, total: 0 };
          }
          categorias[mov.descritivo].receitas += valor;
          categorias[mov.descritivo].total += valor;
        }
      }
    });

    // Calcular MÉDIAS baseadas em TODOS os dados
    const mediaDiaria = {
      despesas: despesasGerais / diasTotais,
      receitas: receitasGerais / diasTotais,
      saldo: (receitasGerais - despesasGerais) / diasTotais,
    };

    const mediaSemanal = {
      despesas: despesasGerais / semanasTotais,
      receitas: receitasGerais / semanasTotais,
      saldo: (receitasGerais - despesasGerais) / semanasTotais,
    };

    const mediaMensal = {
      despesas: despesasGerais / mesesTotais,
      receitas: receitasGerais / mesesTotais,
      saldo: (receitasGerais - despesasGerais) / mesesTotais,
    };

    // Preparar resposta
    const response = {
      success: true,
      periodo: {
        tipo: periodo,
        dataInicio: periodo === 'personalizado' ? dataInicio : null,
        dataFim: periodo === 'personalizado' ? dataFim : null,
        dias: getDaysInPeriod(periodo, dataInicio, dataFim),
      },
      totais: {
        despesas: despesasPeriodo,
        receitas: receitasPeriodo,
        saldo: receitasPeriodo - despesasPeriodo,
      },
      totaisGerais: {
        despesas: despesasGerais,
        receitas: receitasGerais,
        saldo: receitasGerais - despesasGerais,
        diasAnalisados: diasTotais,
      },
      medias: {
        diaria: mediaDiaria,
        semanal: mediaSemanal,
        mensal: mediaMensal,
      },
      transacoes: transacoesPeriodo.length,
      transacoesTotais: transacoesPagas.length,
    };

    // Se agrupado por categoria, adicionar detalhes
    if (agrupar === 'categoria') {
      response.categorias = Object.entries(categorias)
        .map(([nome, valores]) => ({
          nome,
          ...valores,
        }))
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    }

    return res.status(200).json(response);

  } catch (error) {
    console.error('Erro na API GET /estatisticas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      details: error.message,
    });
  }
}
