import React, { createContext, useContext, useState, useEffect } from 'react'

const FormOptionsContext = createContext()

export function FormOptionsProvider({ children }) {
  const [categorias, setCategorias] = useState([])
  const [meses, setMeses] = useState([])
  const [contas, setContas] = useState([])
  const [cartoes, setCartoes] = useState([])
  const [categoryIconMapping, setCategoryIconMapping] = useState({})
  
  const [loading, setLoading] = useState({
    categorias: true,
    meses: true,
    contas: true,
    cartoes: true,
    categoryIcons: true
  })
  
  const [error, setError] = useState({
    categorias: null,
    meses: null,
    contas: null,
    cartoes: null,
    categoryIcons: null
  })

  // Fetch único para categorias
  useEffect(() => {
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => {
        setCategorias(data.data || [])
        setLoading(prev => ({ ...prev, categorias: false }))
      })
      .catch(err => {
        setError(prev => ({ ...prev, categorias: err.message }))
        setLoading(prev => ({ ...prev, categorias: false }))
      })
  }, [])

  // Fetch único para meses
  useEffect(() => {
    fetch('/api/meses')
      .then(res => res.json())
      .then(data => {
        setMeses(data.data || [])
        setLoading(prev => ({ ...prev, meses: false }))
      })
      .catch(err => {
        setError(prev => ({ ...prev, meses: err.message }))
        setLoading(prev => ({ ...prev, meses: false }))
      })
  }, [])

  // Fetch único para contas
  useEffect(() => {
    fetch('/api/contas-config')
      .then(res => res.json())
      .then(data => {
        setContas(data.data || [])
        setLoading(prev => ({ ...prev, contas: false }))
      })
      .catch(err => {
        setError(prev => ({ ...prev, contas: err.message }))
        setLoading(prev => ({ ...prev, contas: false }))
      })
  }, [])

  // Fetch único para cartões
  useEffect(() => {
    fetch('/api/cartoes')
      .then(res => res.json())
      .then(data => {
        setCartoes(data.data || [])
        setLoading(prev => ({ ...prev, cartoes: false }))
      })
      .catch(err => {
        setError(prev => ({ ...prev, cartoes: err.message }))
        setLoading(prev => ({ ...prev, cartoes: false }))
      })
  }, [])

  // Fetch único para mapeamento de ícones de categorias
  useEffect(() => {
    // Adiciona timestamp para evitar cache desatualizado
    const timestamp = Date.now()
    fetch(`/api/category-icons?_t=${timestamp}`)
      .then(res => res.json())
      .then(data => {
        setCategoryIconMapping(data.data || {})
        setLoading(prev => ({ ...prev, categoryIcons: false }))
      })
      .catch(err => {
        setError(prev => ({ ...prev, categoryIcons: err.message }))
        setLoading(prev => ({ ...prev, categoryIcons: false }))
      })
  }, [])

  // Funções de refetch para quando precisar recarregar
  const refetchCategorias = async () => {
    setLoading(prev => ({ ...prev, categorias: true }))
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      setCategorias(data.data || [])
    } catch (err) {
      setError(prev => ({ ...prev, categorias: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, categorias: false }))
    }
  }

  const refetchContas = async () => {
    setLoading(prev => ({ ...prev, contas: true }))
    try {
      const res = await fetch('/api/contas-config')
      const data = await res.json()
      setContas(data.data || [])
    } catch (err) {
      setError(prev => ({ ...prev, contas: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, contas: false }))
    }
  }

  const refetchCartoes = async () => {
    setLoading(prev => ({ ...prev, cartoes: true }))
    try {
      const res = await fetch('/api/cartoes')
      const data = await res.json()
      setCartoes(data.data || [])
    } catch (err) {
      setError(prev => ({ ...prev, cartoes: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, cartoes: false }))
    }
  }

  const refetchCategoryIcons = async () => {
    setLoading(prev => ({ ...prev, categoryIcons: true }))
    try {
      // Adiciona timestamp para forçar bypass do cache
      const timestamp = Date.now()
      const res = await fetch(`/api/category-icons?_t=${timestamp}`)
      const data = await res.json()
      setCategoryIconMapping(data.data || {})
    } catch (err) {
      setError(prev => ({ ...prev, categoryIcons: err.message }))
    } finally {
      setLoading(prev => ({ ...prev, categoryIcons: false }))
    }
  }

  const value = {
    categorias,
    meses,
    contas,
    cartoes,
    categoryIconMapping,
    loading,
    error,
    refetchCategorias,
    refetchContas,
    refetchCartoes,
    refetchCategoryIcons
  }

  return (
    <FormOptionsContext.Provider value={value}>
      {children}
    </FormOptionsContext.Provider>
  )
}

export function useFormOptionsContext() {
  const context = useContext(FormOptionsContext)
  if (!context) {
    throw new Error('useFormOptionsContext deve ser usado dentro de FormOptionsProvider')
  }
  return context
}
