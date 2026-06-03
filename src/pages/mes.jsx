import React, { useState, useEffect } from 'react'
import { BsFillCalendarCheckFill } from 'react-icons/bs'
import { useRouter } from 'next/router'

const mes = () => {
    const router = useRouter()
    const [balanco, setBalanco] = useState([])
    const [loading, setLoading] = useState(true)

    // Pega o mês atual (formato: "01", "02", etc)
    const mesAtual = new Date().toISOString().slice(5, 7)

    useEffect(() => {
        const fetchBalanco = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/balanco-mensal')
                const result = await response.json()
                
                if (result.success) {
                    setBalanco(result.data)
                }
            } catch (error) {
                console.error('Erro ao buscar balanço mensal:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBalanco()
    }, [])

    return (
        <div className="bg-gray-100 min-h-screen">
            <title>Balanço Mensal - CF</title>
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg bg-white overflow-y-auto">
                    <div className="text-center font-bold text-lg mb-4">
                        <span>Balanço Mensal</span>
                    </div>
                    
                    {loading ? (
                        <div className="text-center p-8 text-gray-500">
                            Carregando...
                        </div>
                    ) : balanco.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Nenhum dado disponível
                        </div>
                    ) : (
                        <ul>
                            {balanco.map((bal, index) => (
                                <li
                                    key={index}
                                    onClick={() => router.push(`/mes/${bal.mes}-${bal.ano}`)}
                                    className="bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-4 flex items-center justify-between cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={
                                                bal.mes === mesAtual
                                                    ? 'rounded-full p-3 bg-green-200'
                                                    : 'rounded-full p-3 bg-blue-200'
                                            }
                                        >
                                            <BsFillCalendarCheckFill
                                                className={
                                                    bal.mes === mesAtual
                                                        ? 'text-green-900'
                                                        : 'text-blue-900'
                                                }
                                                size={20}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {bal.mesNome}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {bal.ano}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col gap-0.5">
                                        <div>
                                            <p className="text-xs text-gray-400 leading-none">Saldo acumulado</p>
                                            <p
                                                className={
                                                    bal.saldoNumerico >= 1000
                                                        ? 'text-green-700 font-bold text-base'
                                                        : bal.saldoNumerico > 0
                                                        ? 'text-yellow-600 font-bold text-base'
                                                        : 'text-red-700 font-bold text-base'
                                                }
                                            >
                                                {bal.saldo}
                                            </p>
                                        </div>
                                        {bal.saldoLivre && (
                                            <div>
                                                <p className="text-xs text-gray-400 leading-none">Sobra do mês</p>
                                                <p
                                                    className={
                                                        bal.saldoLivreNumerico >= 1000
                                                            ? 'text-green-600 font-semibold text-sm'
                                                            : bal.saldoLivreNumerico > 0
                                                            ? 'text-yellow-500 font-semibold text-sm'
                                                            : 'text-red-600 font-semibold text-sm'
                                                    }
                                                >
                                                    {bal.saldoLivre}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}

export default mes
