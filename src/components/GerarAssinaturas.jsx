import { useState } from 'react'
import { Modal, Button, Text } from '@nextui-org/react'
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai'
import { MdAutorenew } from 'react-icons/md'

const defaultMesAno = () => {
    const hoje = new Date()
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

const GerarAssinaturas = () => {
    const [visible, setVisible] = useState(false)
    const [mesSelecionado, setMesSelecionado] = useState(defaultMesAno)

    // Estados de progresso
    const [items, setItems] = useState([]) // { detalhes, status: 'pending'|'done'|'error' }
    const [progress, setProgress] = useState(0) // 0-100
    const [running, setRunning] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState(null)

    const handler = () => {
        setVisible(true)
        setItems([])
        setProgress(0)
        setRunning(false)
        setDone(false)
        setError(null)
    }

    const closeHandler = () => {
        if (running) return
        setVisible(false)
    }

    const gerarCobranças = async () => {
        setError(null)
        setRunning(true)
        setDone(false)
        setProgress(0)

        try {
            // 1. Busca a lista pré-calculada
            const previewRes = await fetch(`/api/gerar-assinaturas?mesAno=${mesSelecionado}`)
            const preview = await previewRes.json()

            if (!preview.success) {
                setError(preview.error || 'Erro ao buscar assinaturas')
                setRunning(false)
                return
            }

            const lista = preview.data
            if (!lista.length) {
                setError('Nenhuma assinatura encontrada na planilha.')
                setRunning(false)
                return
            }

            // Inicializa itens como pending
            setItems(lista.map(t => ({ detalhes: t.detalhes, status: 'pending' })))

            // 2. Cria cada uma individualmente, atualizando progresso
            for (let i = 0; i < lista.length; i++) {
                const res = await fetch('/api/gerar-assinaturas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transacao: lista[i] }),
                })
                const result = await res.json()
                const status = result.success ? 'done' : 'error'

                setItems(prev =>
                    prev.map((item, idx) => idx === i ? { ...item, status } : item)
                )
                setProgress(Math.round(((i + 1) / lista.length) * 100))
            }

            setDone(true)
        } catch (err) {
            setError(err.message || 'Erro inesperado')
        } finally {
            setRunning(false)
        }
    }

    const total = items.length
    const doneCount = items.filter(i => i.status === 'done').length
    const errorCount = items.filter(i => i.status === 'error').length

    return (
        <div>
            <Button
                className="text-blue-800 bg-blue-200 mt-2"
                size="sm"
                shadow
                color=""
                onPress={handler}
            >
                <span className="flex items-center gap-1">
                    <MdAutorenew size={16} />
                    Gerar Assinaturas
                </span>
            </Button>

            <Modal
                closeButton={!running}
                aria-labelledby="gerar-assinaturas-title"
                open={visible}
                onClose={closeHandler}
                width="420px"
            >
                <Modal.Header>
                    <Text id="gerar-assinaturas-title" size={18} b>
                        Gerar Cobranças de Assinaturas
                    </Text>
                </Modal.Header>

                <Modal.Body>
                    {/* Seletor de mês — só visível antes de iniciar */}
                    {!running && !done && !items.length && (
                        <div className="flex flex-col gap-3">
                            <Text size={14} css={{ color: '$accents7' }}>
                                Cria uma cobrança em <b>Extrato Crédito</b> para cada assinatura
                                cadastrada, como <em>fixa</em> e com situação <em>A pagar</em>.
                            </Text>
                            <div className="flex flex-col gap-1">
                                <Text size={13} b>Mês de referência</Text>
                                <input
                                    type="month"
                                    value={mesSelecionado}
                                    onChange={(e) => setMesSelecionado(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Barra de progresso + lista de itens */}
                    {(running || done) && total > 0 && (
                        <div className="flex flex-col gap-3">
                            {/* Barra */}
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{running ? 'Gerando cobranças...' : 'Concluído'}</span>
                                    <span>{doneCount + errorCount}/{total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-2.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor: errorCount > 0 ? '#ef4444' : '#3b82f6',
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Lista de itens */}
                            <ul className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                                {items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        {item.status === 'pending' && (
                                            <span className="w-4 h-4 rounded-full border-2 border-gray-300 inline-block shrink-0" />
                                        )}
                                        {item.status === 'done' && (
                                            <AiFillCheckCircle size={16} className="text-green-500 shrink-0" />
                                        )}
                                        {item.status === 'error' && (
                                            <AiFillCloseCircle size={16} className="text-red-500 shrink-0" />
                                        )}
                                        <span className={item.status === 'error' ? 'text-red-600' : 'text-gray-700'}>
                                            {item.detalhes}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {done && (
                                <Text size={13} css={{ color: errorCount > 0 ? '$error' : '$success' }} b>
                                    {errorCount > 0
                                        ? `${doneCount} criada(s), ${errorCount} erro(s)`
                                        : `${doneCount} cobrança(s) criada(s) com sucesso`}
                                </Text>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600">
                            <AiFillCloseCircle size={20} />
                            <Text color="error" size={14}>{error}</Text>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler} disabled={running}>
                        {done ? 'Fechar' : 'Cancelar'}
                    </Button>
                    {!done && !running && (
                        <Button auto onPress={gerarCobranças} color="primary">
                            Gerar
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default GerarAssinaturas
