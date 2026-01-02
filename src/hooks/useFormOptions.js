import { useState, useEffect } from 'react'
import { getCategorias, getMeses, getContas, getCartoes, getStatus } from '@/services/api'

// Hook para buscar categorias
export function useCategorias() {
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchCategorias() {
            try {
                setLoading(true)
                const data = await getCategorias()
                // A API retorna array de objetos {nome: "categoria"}
                setCategorias(data.map(item => item.nome))
            } catch (err) {
                console.error('Erro ao buscar categorias:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchCategorias()
    }, [])

    return { categorias, loading, error }
}

// Hook para buscar meses
export function useMeses() {
    const [meses, setMeses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchMeses() {
            try {
                setLoading(true)
                const data = await getMeses()
                // A API retorna array de objetos {nome: "Janeiro"}
                setMeses(data.map(item => item.nome))
            } catch (err) {
                console.error('Erro ao buscar meses:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchMeses()
    }, [])

    return { meses, loading, error }
}

// Hook para buscar contas
export function useContas() {
    const [contas, setContas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = async () => {
        try {
            setLoading(true)
            const data = await getContas()
            setContas(data.map(item => item.nome))
        } catch (err) {
            console.error('Erro ao buscar contas:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [])

    return { contas, loading, error, refetch }
}

// Hook para buscar cartões
export function useCartoes() {
    const [cartoes, setCartoes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = async () => {
        try {
            setLoading(true)
            const data = await getCartoes()
            setCartoes(data.map(item => item.nome))
        } catch (err) {
            console.error('Erro ao buscar cartões:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [])

    return { cartoes, loading, error, refetch }
}

// Hook para buscar status baseado no tipo de transação
export function useStatus(tipo) {
    const [status, setStatus] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function fetchStatus() {
            if (!tipo) return
            
            try {
                setLoading(true)
                const data = await getStatus(tipo)
                setStatus(data.map(item => item.nome))
            } catch (err) {
                console.error('Erro ao buscar status:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchStatus()
    }, [tipo])

    return { status, loading, error }
}
