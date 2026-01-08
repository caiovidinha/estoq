import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { BiArrowBack } from 'react-icons/bi'
import { BsCalendar3, BsArrowUp, BsArrowDown } from 'react-icons/bs'

const VisaoMensal = () => {
    const router = useRouter()
    const { mesAno } = router.query
    const [transacoes, setTransacoes] = useState([])
    const [fluxoCaixa, setFluxoCaixa] = useState([])
    const [saldoAtual, setSaldoAtual] = useState(0)
    const [loading, setLoading] = useState(true)
    const [mesNome, setMesNome] = useState('')
    const [ehMesFuturo, setEhMesFuturo] = useState(false)

    useEffect(() => {
        if (!mesAno) return

        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Extrai mês e ano da URL (formato: "01-2026")
                const [mes, ano] = mesAno.split('-')
                const mesInt = parseInt(mes)
                const anoInt = parseInt(ano)
                
                // Define nome do mês
                const meses = ['', 'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 
                               'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 
                               'NOVEMBRO', 'DEZEMBRO']
                setMesNome(`${meses[mesInt]} ${ano}`)

                // Busca saldo atual
                const saldoRes = await fetch('/api/saldo')
                const saldoData = await saldoRes.json()
                let saldoAtualValor = 0
                if (saldoData.success) {
                    saldoAtualValor = parseFloat(
                        saldoData.valor
                            .replace('R$', '')
                            .replace(/\./g, '')
                            .replace(',', '.')
                            .trim()
                    )
                }

                // Determina se é mês futuro
                const hoje = new Date()
                const mesAtual = hoje.getMonth() + 1 // 0-11 -> 1-12
                const anoAtual = hoje.getFullYear()
                
                const ehMesFuturo = (anoInt > anoAtual) || (anoInt === anoAtual && mesInt > mesAtual)
                setEhMesFuturo(ehMesFuturo)
                
                let saldoInicial = saldoAtualValor
                
                // Se for mês futuro, calcula o saldo acumulado dos meses anteriores
                if (ehMesFuturo) {
                    // Calcula todos os meses entre hoje e o mês desejado
                    let mesCalculo = mesAtual
                    let anoCalculo = anoAtual
                    saldoInicial = saldoAtualValor
                    
                    while (anoCalculo < anoInt || (anoCalculo === anoInt && mesCalculo < mesInt)) {
                        const mesStr = String(mesCalculo).padStart(2, '0')
                        const transRes = await fetch(`/api/transacoes-fixas?mes=${mesStr}&ano=${anoCalculo}`)
                        const transData = await transRes.json()
                        
                        if (transData.success) {
                            // Soma todas as transações pendentes deste mês
                            const totalMes = transData.data
                                .filter(t => t.situação === 'A pagar' || t.situação === 'A receber')
                                .reduce((acc, t) => acc + t.valorNumerico, 0)
                            
                            saldoInicial += totalMes
                        }
                        
                        // Avança para o próximo mês
                        mesCalculo++
                        if (mesCalculo > 12) {
                            mesCalculo = 1
                            anoCalculo++
                        }
                    }
                }
                
                setSaldoAtual(saldoInicial)

                // Busca transações fixas do mês
                const transRes = await fetch(`/api/transacoes-fixas?mes=${mes}&ano=${ano}`)
                const transData = await transRes.json()
                
                if (transData.success) {
                    // Filtra apenas transações que ainda não foram pagas/recebidas
                    const transacoesPendentes = transData.data.filter(trans => {
                        return trans.situação === 'A pagar' || trans.situação === 'A receber'
                    })
                    
                    setTransacoes(transacoesPendentes)
                    
                    // Agrupa transações por dia
                    const transacoesPorDia = {}
                    
                    transacoesPendentes.forEach(trans => {
                        const dia = trans.dia
                        if (!transacoesPorDia[dia]) {
                            transacoesPorDia[dia] = {
                                dia: dia,
                                transacoes: [],
                                totalDia: 0,
                                totalReceitas: 0,
                                totalDespesas: 0
                            }
                        }
                        transacoesPorDia[dia].transacoes.push(trans)
                        transacoesPorDia[dia].totalDia += trans.valorNumerico
                        
                        if (trans.tipo === 'RECEITA') {
                            transacoesPorDia[dia].totalReceitas += trans.valorNumerico
                        } else {
                            transacoesPorDia[dia].totalDespesas += trans.valorNumerico
                        }
                    })
                    
                    // Ordena por dia e calcula saldo acumulado
                    const diasOrdenados = Object.keys(transacoesPorDia)
                        .map(Number)
                        .sort((a, b) => a - b)
                    
                    let saldoAcumulado = saldoInicial
                    const fluxo = diasOrdenados.map(dia => {
                        const dadosDia = transacoesPorDia[dia]
                        saldoAcumulado += dadosDia.totalDia
                        
                        return {
                            dia: dia,
                            totalDia: dadosDia.totalDia,
                            totalReceitas: dadosDia.totalReceitas,
                            totalDespesas: dadosDia.totalDespesas,
                            quantidadeTransacoes: dadosDia.transacoes.length,
                            saldoAposDia: saldoAcumulado,
                            transacoes: dadosDia.transacoes
                        }
                    })
                    
                    setFluxoCaixa(fluxo)
                }
            } catch (error) {
                console.error('Erro ao buscar dados:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [mesAno])

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor)
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <title>Visão Mensal - CF</title>
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg bg-white overflow-y-auto">
                    {/* Header com botão voltar */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => router.push('/mes')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <BiArrowBack size={20} />
                            <span>Voltar</span>
                        </button>
                        <h1 className="text-xl font-bold text-center flex-1">
                            {mesNome}
                        </h1>
                        <div className="w-20"></div> {/* Spacer para centralizar título */}
                    </div>

                    {/* Saldo Inicial */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-600">
                            {ehMesFuturo ? 'Saldo Projetado no Início do Mês' : `Saldo Atual (Hoje, ${new Date().toLocaleDateString('pt-BR')})`}
                        </p>
                        <p className="text-xl font-bold text-blue-700">
                            {formatarMoeda(saldoAtual)}
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center p-8 text-gray-500">
                            Carregando...
                        </div>
                    ) : transacoes.length === 0 ? (
                        <div className="text-center p-8 text-gray-500">
                            Nenhuma transação a pagar/receber neste mês
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <h2 className="font-semibold text-gray-700 mb-3 text-sm flex items-center gap-2">
                                <BsCalendar3 size={16} />
                                Projeção por Data ({fluxoCaixa.length} {fluxoCaixa.length === 1 ? 'dia' : 'dias'})
                            </h2>
                            
                            {/* Tabela compacta */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 pt-2 -mt-2 shadow-sm">
                                        <tr>
                                            <th className="text-left py-2 px-1 font-semibold text-gray-700 whitespace-nowrap">Data</th>
                                            <th className="text-right py-2 px-1 font-semibold text-gray-700 whitespace-nowrap">Movim.</th>
                                            <th className="text-right py-2 px-1 font-semibold text-gray-700 whitespace-nowrap">Saldo Proj.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fluxoCaixa.map((diaData, index) => {
                                            const temReceita = diaData.totalReceitas > 0
                                            const temDespesa = diaData.totalDespesas < 0
                                            
                                            return (
                                                <tr 
                                                    key={index} 
                                                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                                                        temReceita && temDespesa 
                                                            ? 'bg-yellow-50/30' 
                                                            : temReceita 
                                                            ? 'bg-green-50/30' 
                                                            : 'bg-red-50/30'
                                                    }`}
                                                >
                                                    <td className="py-2 px-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-bold text-gray-800">
                                                                {String(diaData.dia).padStart(2, '0')}/{mesAno.replace("-","/")}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({diaData.quantidadeTransacoes})
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={`py-2 px-1 text-right font-semibold whitespace-nowrap ${
                                                        diaData.totalDia > 0 
                                                            ? 'text-green-700' 
                                                            : diaData.totalDia < 0 
                                                            ? 'text-red-700' 
                                                            : 'text-gray-700'
                                                    }`}>
                                                        {formatarMoeda(diaData.totalDia)}
                                                    </td>
                                                    <td className={`py-2 px-1 text-right font-bold whitespace-nowrap ${
                                                        diaData.saldoAposDia >= 0 
                                                            ? 'text-blue-700' 
                                                            : 'text-red-700'
                                                    }`}>
                                                        {formatarMoeda(diaData.saldoAposDia)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumo Final compacto */}
                            <div className="bg-blue-100 rounded-lg p-3 mt-4 shadow-sm border border-blue-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-semibold text-sm">
                                        Saldo Final Projetado
                                    </span>
                                    <span
                                        className={
                                            fluxoCaixa[fluxoCaixa.length - 1]?.saldoAposDia >= 0
                                                ? 'text-blue-700 font-bold text-xl'
                                                : 'text-red-700 font-bold text-xl'
                                        }
                                    >
                                        {formatarMoeda(
                                            fluxoCaixa[fluxoCaixa.length - 1]?.saldoAposDia || saldoAtual
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VisaoMensal
