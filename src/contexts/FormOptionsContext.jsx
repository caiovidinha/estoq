import React, { createContext, useContext, useState, useEffect } from 'react'

const FormOptionsContext = createContext()

export function FormOptionsProvider({ children }) {
  const [categorias, setCategorias] = useState([])
  const [meses, setMeses] = useState([])
  const [contas, setContas] = useState([])
  const [cartoes, setCartoes] = useState([])
  
  const [loading, setLoading] = useState({
    categorias: true,
    meses: true,
    contas: true,
    cartoes: true
  })
  
  const [error, setError] = useState({
    categorias: null,
    meses: null,
    contas: null,
    cartoes: null
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

  const value = {
    categorias,
    meses,
    contas,
    cartoes,
    loading,
    error,
    refetchCategorias,
    refetchContas,
    refetchCartoes
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
