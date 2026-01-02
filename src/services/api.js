// Configuração da API
const API_BASE_URL = 'https://controle-financeiro-api-kp0a.onrender.com/api'

// Helper para fazer requisições
async function fetchAPI(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
            throw new Error(error.message || `Erro ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Erro na API:', error)
        throw error
    }
}

// ========== TRANSAÇÕES (CONTA) ==========

export async function getTransacoes(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page)
    if (filters.page_size) params.append('page_size', filters.page_size)
    if (filters.tipo) params.append('tipo', filters.tipo)
    if (filters.categoria) params.append('categoria', filters.categoria)
    if (filters.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters.data_fim) params.append('data_fim', filters.data_fim)
    if (filters.mes) params.append('mes', filters.mes)
    if (filters.situacao) params.append('situacao', filters.situacao)
    if (filters.conta) params.append('conta', filters.conta)
    if (filters.order_by) params.append('order_by', filters.order_by)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchAPI(`/transacoes${query}`)
}

export async function createTransacao(data) {
    return fetchAPI('/transacoes', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export async function updateTransacao(rowIndex, data) {
    return fetchAPI(`/transacoes/${rowIndex}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

export async function deleteTransacao(rowIndex) {
    return fetchAPI(`/transacoes/${rowIndex}`, {
        method: 'DELETE',
    })
}

// ========== TRANSAÇÕES DE CRÉDITO ==========

export async function getTransacoesCredito(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page)
    if (filters.page_size) params.append('page_size', filters.page_size)
    if (filters.tipo) params.append('tipo', filters.tipo)
    if (filters.categoria) params.append('categoria', filters.categoria)
    if (filters.data_inicio) params.append('data_inicio', filters.data_inicio)
    if (filters.data_fim) params.append('data_fim', filters.data_fim)
    if (filters.mes) params.append('mes', filters.mes)
    if (filters.situacao) params.append('situacao', filters.situacao)
    if (filters.cartao) params.append('cartao', filters.cartao)
    if (filters.order_by) params.append('order_by', filters.order_by)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchAPI(`/transacoes-credito${query}`)
}

export async function createTransacaoCredito(data) {
    return fetchAPI('/transacoes-credito', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export async function updateTransacaoCredito(rowIndex, data) {
    return fetchAPI(`/transacoes-credito/${rowIndex}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

export async function deleteTransacaoCredito(rowIndex) {
    return fetchAPI(`/transacoes-credito/${rowIndex}`, {
        method: 'DELETE',
    })
}

// ========== CONFIGURAÇÕES ==========

export async function getCategorias() {
    return fetchAPI('/configuracoes/categorias')
}

export async function createCategoria(data) {
    // Aceita { name, type, icon } ou apenas nome (string) para compatibilidade
    const payload = typeof data === 'string' ? { nome: data } : data
    return fetchAPI('/configuracoes/categorias', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

export async function deleteCategoria(nome) {
    return fetchAPI(`/configuracoes/categorias/${encodeURIComponent(nome)}`, {
        method: 'DELETE',
    })
}

export async function getStatus(tipo) {
    const query = tipo ? `?tipo=${tipo}` : ''
    return fetchAPI(`/configuracoes/status${query}`)
}

export async function getMeses() {
    return fetchAPI('/configuracoes/meses')
}

export async function getContas() {
    return fetchAPI('/configuracoes/contas')
}

export async function createConta(nome) {
    return fetchAPI('/configuracoes/contas', {
        method: 'POST',
        body: JSON.stringify({ nome }),
    })
}

export async function updateConta(nomeAntigo, nomeNovo) {
    return fetchAPI(`/configuracoes/contas/${encodeURIComponent(nomeAntigo)}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: nomeNovo }),
    })
}

export async function deleteConta(nome) {
    return fetchAPI(`/configuracoes/contas/${encodeURIComponent(nome)}`, {
        method: 'DELETE',
    })
}

export async function getCartoes() {
    return fetchAPI('/configuracoes/cartoes')
}

export async function createCartao(nome) {
    return fetchAPI('/configuracoes/cartoes', {
        method: 'POST',
        body: JSON.stringify({ nome }),
    })
}

export async function updateCartao(nomeAntigo, nomeNovo) {
    return fetchAPI(`/configuracoes/cartoes/${encodeURIComponent(nomeAntigo)}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: nomeNovo }),
    })
}

export async function deleteCartao(nome) {
    return fetchAPI(`/configuracoes/cartoes/${encodeURIComponent(nome)}`, {
        method: 'DELETE',
    })
}

export async function updateLimiteCartao(cartaoId, novoLimite) {
    return fetchAPI(`/configuracoes/cartoes/${cartaoId}/limite`, {
        method: 'PUT',
        body: JSON.stringify({ limite: novoLimite }),
    })
}

// ========== SALDOS ==========

export async function getSaldos() {
    // Retorna saldo geral de todas as contas
    return fetchAPI('/saldos')
}

export async function getSaldosContas() {
    // Retorna saldo detalhado por conta (também lista todas as contas com seus saldos)
    return fetchAPI('/saldos/contas')
}

// ========== HEALTH CHECK ==========

export async function checkHealth() {
    return fetchAPI('/health')
}

// ========== HELPERS DE FORMATAÇÃO ==========

export function formatValorParaAPI(valor) {
    // Converte número para formato da API: R$ 150,00
    if (typeof valor === 'number') {
        return `R$ ${valor.toFixed(2).replace('.', ',')}`
    }
    return valor
}

export function formatDataParaAPI(date) {
    // Converte Date para DD/MM/YYYY
    if (date instanceof Date) {
        const dia = String(date.getDate()).padStart(2, '0')
        const mes = String(date.getMonth() + 1).padStart(2, '0')
        const ano = date.getFullYear()
        return `${dia}/${mes}/${ano}`
    }
    return date
}

export function formatValorDaAPI(valor) {
    // Converte R$ 150,00 para número
    if (typeof valor === 'string') {
        return parseFloat(valor.replace('R$', '').replace('.', '').replace(',', '.').trim())
    }
    return valor
}

export function formatDataDaAPI(dataStr) {
    // Converte DD/MM/YYYY para Date
    if (typeof dataStr === 'string') {
        const [dia, mes, ano] = dataStr.split('/')
        return new Date(ano, mes - 1, dia)
    }
    return dataStr
}
