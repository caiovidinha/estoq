import { React, useState, useEffect } from 'react'
import { Modal, Button, Text, Card } from '@nextui-org/react'
import { BsCreditCard2Front } from 'react-icons/bs'

const SeeCreditCards = () => {
    const [cartoesComFaturas, setCartoesComFaturas] = useState([])
    const [visible, setVisible] = useState(false)
    const [viewMode, setViewMode] = useState('proximas') // 'proximas' ou 'mensal'
    const [selectedMonth, setSelectedMonth] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [mesesDisponiveis, setMesesDisponiveis] = useState([])
    
    const handler = () => setVisible(true)
    const closeHandler = () => setVisible(false)

    // Gera lista de meses (12 meses a partir do atual)
    useEffect(() => {
        const hoje = new Date()
        const meses = []
        
        for (let i = 0; i < 12; i++) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
            const mesNum = String(data.getMonth() + 1).padStart(2, '0')
            const ano = data.getFullYear()
            const mesNome = data.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
            
            meses.push({
                valor: mesNum,
                label: `${mesNum} - ${mesNome}`,
                ano
            })
        }
        
        setMesesDisponiveis(meses)
        setSelectedMonth(meses[0].valor)
        setSelectedYear(meses[0].ano)
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            if (!visible) return
            
            try {
                // Busca todos os cartões com seus limites
                const cartoesRes = await fetch('/api/limites-cartoes')
                const cartoesData = await cartoesRes.json()
                
                if (!cartoesData.success) return
                
                const cartoes = cartoesData.data
                
                // Busca faturas
                let faturasRes
                if (viewMode === 'proximas') {
                    // Busca próximas faturas a pagar
                    faturasRes = await fetch('/api/faturas?status=A pagar')
                } else {
                    // Busca faturas do mês/ano selecionado
                    faturasRes = await fetch(`/api/faturas?mes=${selectedMonth}`)
                }
                
                const faturasData = await faturasRes.json()
                
                
                
                if (!faturasData.success || !faturasData.data || faturasData.data.length === 0) {
                    // Se não houver faturas, mostra apenas os cartões com limite total disponível
                    setCartoesComFaturas(cartoes.map(c => ({
                        nome: c.nome,
                        limite: c.limite,
                        limiteFormatado: c.limiteFormatado,
                        fatura: 0,
                        faturaFormatada: 'R$ 0,00',
                        limiteRestante: c.limite,
                        limiteRestanteFormatado: c.limiteFormatado,
                        vencimento: '-',
                        status: 'Sem fatura'
                    })))
                    return
                }
                
                const faturas = faturasData.data
                
                
                
                
                // Agrupa faturas por cartão (pega apenas a primeira/próxima de cada)
                // Remove o prefixo "Fatura " para fazer o match com o nome do cartão
                const faturaPorCartao = {}
                faturas.forEach(fatura => {
                    // Remove "Fatura " do início do nome
                    const nomeCartao = fatura.cartão.replace(/^Fatura\s+/i, '').trim()
                    
                    if (!faturaPorCartao[nomeCartao]) {
                        faturaPorCartao[nomeCartao] = fatura
                    }
                })
                
                
                
                // Combina cartões com suas faturas
                const resultado = cartoes.map(cartao => {
                    const fatura = faturaPorCartao[cartao.nome]
                    
                    if (fatura) {
                        // Usa o valor da fatura que já vem formatado da planilha
                        const valorFaturaStr = fatura.valor || 'R$ 0,00'
                        const valorFatura = parseFloat(
                            valorFaturaStr
                                .replace('R$', '')
                                .replace(/\s/g, '')
                                .replace(/\./g, '')
                                .replace(',', '.')
                        ) || 0
                        
                        const limiteRestante = Math.max(0, cartao.limite - valorFatura)
                        
                        return {
                            nome: cartao.nome,
                            limite: cartao.limite,
                            limiteFormatado: cartao.limiteFormatado,
                            fatura: valorFatura,
                            faturaFormatada: valorFaturaStr,
                            limiteRestante,
                            limiteRestanteFormatado: new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(limiteRestante),
                            vencimento: fatura.vencimento || '-',
                            status: fatura.status || '-'
                        }
                    } else {
                        // Cartão sem fatura no período
                        return {
                            nome: cartao.nome,
                            limite: cartao.limite,
                            limiteFormatado: cartao.limiteFormatado,
                            fatura: 0,
                            faturaFormatada: 'R$ 0,00',
                            limiteRestante: cartao.limite,
                            limiteRestanteFormatado: cartao.limiteFormatado,
                            vencimento: '-',
                            status: 'Sem fatura'
                        }
                    }
                })
                
                setCartoesComFaturas(resultado)
            } catch (error) {
                console.error('Erro ao carregar dados:', error)
            }
        }
        
        fetchData()
    }, [visible, viewMode, selectedMonth, selectedYear])

    const handleMonthChange = (e) => {
        const mesValor = e.target.value
        setSelectedMonth(mesValor)
        
        // Encontra o ano correspondente
        const mesObj = mesesDisponiveis.find(m => m.valor === mesValor)
        if (mesObj) {
            setSelectedYear(mesObj.ano)
        }
    }

    return (
        <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
            <Button
                className="bg-blue-200 flex justify-center items-center mt-2 sm:ml-6 -ml-0.5"
                auto
                rounded
                shadow
                color="green"
                onPress={handler}
                icon={<BsCreditCard2Front className="text-blue-800" size={20} />}
            ></Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
                width="90%"
                className="max-w-2xl"
            >
                <Modal.Header>
                    <div className="w-full">
                        <Text id="modal-title" size={18}>
                            <Text b size={18}>
                                Cartões de Crédito
                            </Text>
                        </Text>
                        
                        {/* Switch de Visão */}
                        <div className="flex gap-2 mt-3 mb-2">
                            <button
                                onClick={() => setViewMode('proximas')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                                    viewMode === 'proximas'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                <span className="hidden sm:inline">Próximas Faturas</span>
                                <span className="sm:hidden">Próximas</span>
                            </button>
                            <button
                                onClick={() => setViewMode('mensal')}
                                className={`flex-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                                    viewMode === 'mensal'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            >
                                Por Mês
                            </button>
                        </div>
                        
                        {/* Filtro de Mês (apenas quando modo mensal) */}
                        {viewMode === 'mensal' && (
                            <div className="mt-2">
                                <select
                                    value={selectedMonth}
                                    onChange={handleMonthChange}
                                    className="w-full p-2 border rounded-lg bg-purple-100 text-purple-800 font-semibold text-xs sm:text-sm"
                                >
                                    {mesesDisponiveis.map(mes => (
                                        <option key={mes.valor} value={mes.valor}>
                                            {mes.label} / {mes.ano}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                            <ul>
                                {cartoesComFaturas.length === 0 ? (
                                    <Text className="text-gray-500">Nenhum cartão cadastrado</Text>
                                ) : (
                                    cartoesComFaturas.map((cartao, index) => (
                                        <li key={index} className="mb-3">
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                {/* Layout responsivo */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-2 min-w-0 flex-1">
                                                        <div className="rounded-full p-2 bg-purple-200 flex-shrink-0">
                                                            <BsCreditCard2Front className="text-purple-700" size={16} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <Text b size={14} className="truncate block">{cartao.nome}</Text>
                                                            
                                                            {/* Mobile: layout vertical */}
                                                            <div className="sm:hidden flex flex-col gap-1 mt-1 text-xs text-gray-600">
                                                                <div>Limite: <strong className="text-purple-700">{cartao.limiteFormatado}</strong></div>
                                                                <div>Fatura: <strong className="text-red-600">{cartao.faturaFormatada}</strong></div>
                                                                {cartao.vencimento !== '-' && (
                                                                    <div>Venc: <strong>{cartao.vencimento}</strong></div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Desktop: layout horizontal */}
                                                            <div className="hidden sm:flex gap-2 flex-wrap text-xs text-gray-600 mt-1">
                                                                <span className="whitespace-nowrap">Limite: <strong className="text-purple-700">{cartao.limiteFormatado}</strong></span>
                                                                <span>•</span>
                                                                <span className="whitespace-nowrap">Fatura: <strong className="text-red-600">{cartao.faturaFormatada}</strong></span>
                                                                {cartao.vencimento !== '-' && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="whitespace-nowrap">Venc: {cartao.vencimento}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Valor disponível */}
                                                    <div className="text-right flex-shrink-0">
                                                        <Text b color="success" size={14} className="whitespace-nowrap">
                                                            {cartao.limiteRestanteFormatado}
                                                        </Text>
                                                        <Text size={9} className="text-gray-400 whitespace-nowrap">
                                                            Disponível
                                                        </Text>
                                                    </div>
                                                </div>
                                                
                                                {/* Status badge */}
                                                {cartao.status !== '-' && cartao.status !== 'Sem fatura' && (
                                                    <div className="mt-2 pl-0 sm:pl-10">
                                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                                            cartao.status === 'Pago' 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : cartao.status === 'A pagar'
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {cartao.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </Card.Body>
                    </Card>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default SeeCreditCards
