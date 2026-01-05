import { useFormOptionsContext } from '@/contexts/FormOptionsContext'

// Hook para buscar categorias - agora consumindo do Context
export function useCategorias() {
    const { categorias, loading, error } = useFormOptionsContext()
    
    return { 
        categorias, 
        loading: loading.categorias, 
        error: error.categorias 
    }
}

// Hook para buscar meses - agora consumindo do Context
export function useMeses() {
    const { meses, loading, error } = useFormOptionsContext()
    
    return { 
        meses, 
        loading: loading.meses, 
        error: error.meses 
    }
}

// Hook para buscar contas - agora consumindo do Context
export function useContas() {
    const { contas, loading, error, refetchContas } = useFormOptionsContext()
    
    return { 
        contas, 
        loading: loading.contas, 
        error: error.contas,
        refetch: refetchContas
    }
}

// Hook para buscar cartões - agora consumindo do Context
export function useCartoes() {
    const { cartoes, loading, error, refetchCartoes } = useFormOptionsContext()
    
    return { 
        cartoes, 
        loading: loading.cartoes, 
        error: error.cartoes,
        refetch: refetchCartoes
    }
}

// Hook para buscar status (TODO: implementar quando houver endpoint)
export function useStatus(tipo) {
    const status = []
    const loading = false
    const error = null

    // TODO: Implementar busca de status quando criar endpoint
    // Mantido como placeholder para compatibilidade

    return { status, loading, error }
}
