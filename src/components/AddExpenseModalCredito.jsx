import { React, useState, useMemo } from 'react'
import {
    Switch,
    Modal,
    Button,
    Text,
    Input,
    Dropdown,
    Loading,
} from '@nextui-org/react'
import CategoryDropdown from '@/components/CategoryDropdown';
import { GiTakeMyMoney } from 'react-icons/gi'
import { MdMoneyOffCsred, MdAttachMoney } from 'react-icons/md'
import { AiFillCheckCircle, AiFillExclamationCircle, AiFillCloseCircle } from 'react-icons/ai'
import { useMeses, useCartoes } from '@/hooks/useFormOptions'
// REMOVIDO: import { createTransacaoCredito } from '@/services/api'

const AddExpenseModalCrédito = () => {
    const [selectedValue, setSelectedValue] = useState('Categoria');
    const [invalid, setInvalid] = useState(false)
    const [created, setCreated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isParcelado, setIsParcelado] = useState(false)
    const [numParcelas, setNumParcelas] = useState(2)

    // Hooks para buscar dados da API
    const { meses } = useMeses()
    const { cartoes } = useCartoes()

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
    const closeHandler = () => {
        setVisible(false)
        setError(null)
        setInvalid(false)
        setIsParcelado(false)
        setNumParcelas(2)
    }

    const formatarMoeda = () => {
        var elemento = document.getElementById('valor-despesa-credito')
        var valor = elemento.value

        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, '.$1')

        elemento.value = valor
        if (valor === 'NaN') elemento.value = ''
    }

    const getNextMesFromArray = (baseMes, offset) => {
        const idx = meses.indexOf(baseMes)
        if (idx === -1) return baseMes
        return meses[(idx + offset) % meses.length]
    }

    const addMonthsToDate = (dateStr, months) => {
        const [dia, mesNum, ano] = dateStr.split('/')
        const date = new Date(parseInt(ano), parseInt(mesNum) - 1 + months, parseInt(dia))
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
    }

    const getForm = async () => {
        try {
            const categoria = selectedValue
            const mes = selectedValueMes
            const cartao = selectedValueCard
            const valorInput = document.getElementById('valor-despesa-credito').value
            const dataInput = document.getElementById('data-despesa-credito').value
            const descricao = document.getElementById('descricao-despesa-credito').value

            if (!categoria || categoria === 'Categoria' || !mes || mes === 'Mês' ||
                !valorInput || !dataInput || !descricao || !cartao || cartao === 'Cartão') {
                setInvalid(true)
                setTimeout(() => setInvalid(false), 3000)
                return
            }

            if (isParcelado && (!numParcelas || numParcelas < 2)) {
                setInvalid(true)
                setTimeout(() => setInvalid(false), 3000)
                return
            }

            let valorNumerico = valorInput.replace(/[\D]+/g, '')
            let valorDecimal = (parseFloat(valorNumerico) / 100).toFixed(2)
            // Despesas devem ter valor NEGATIVO
            let valorFormatado = '-' + valorDecimal

            const [ano, mesNum, dia] = dataInput.split('-')
            const dataFormatada = `${dia}/${mesNum}/${ano}`

            const status = document.getElementById('status-despesa-credito').getAttribute('data-state') === 'checked'
                ? 'Pago'
                : 'A pagar'

            setLoading(true)
            setError(null)

            if (isParcelado) {
                const total = parseInt(numParcelas)
                for (let i = 0; i < total; i++) {
                    const transacao = {
                        tipo: 'DESPESA',
                        descritivo: categoria,
                        valor: valorFormatado,
                        data: addMonthsToDate(dataFormatada, i),
                        mes: getNextMesFromArray(mes, i),
                        detalhes: `${descricao} (${i + 1}/${total})`,
                        situacao: status,
                        cartao: cartao,
                        fixa: true,
                    }
                    const response = await fetch('/api/transacoes-credito', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(transacao),
                    })
                    const result = await response.json()
                    if (!result.success) {
                        setLoading(false)
                        setInvalid(true)
                        setTimeout(() => setInvalid(false), 3000)
                        return
                    }
                }
            } else {
                const fixa = document.getElementById('fixa-despesa-credito')?.getAttribute('data-state') === 'checked'
                const transacao = {
                    tipo: 'DESPESA',
                    descritivo: categoria,
                    valor: valorFormatado,
                    data: dataFormatada,
                    mes: mes,
                    detalhes: descricao,
                    situacao: status,
                    cartao: cartao,
                    fixa: fixa,
                }
                const response = await fetch('/api/transacoes-credito', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(transacao),
                })
                const result = await response.json()
                if (!result.success) {
                    setLoading(false)
                    setInvalid(true)
                    setTimeout(() => setInvalid(false), 3000)
                    return
                }
            }

            setLoading(false)
            setCreated(true)

            setTimeout(() => {
                setCreated(false)
                setSelectedMes(new Set(['Mês']))
                setSelectedCard(new Set(['Cartão']))
                setSelectedValue('Categoria')
                setIsParcelado(false)
                setNumParcelas(2)
                document.getElementById('valor-despesa-credito').value = ''
                document.getElementById('data-despesa-credito').value = ''
                document.getElementById('descricao-despesa-credito').value = ''
                window.location.reload()
            }, 1300)

        } catch (err) {
            console.error('Erro ao criar despesa:', err)
            setLoading(false)
            setError(err.message || 'Erro ao criar despesa')
            setTimeout(() => setError(null), 5000)
        }
    }

    const fillDate = () => {
        const dataInput = document.querySelector('#data-despesa-credito')
        var data = new Date()
        var dia = String(data.getDate()).padStart(2, '0')
        var mes = String(data.getMonth() + 1).padStart(2, '0')
        var ano = data.getFullYear()
        const dataAtual = ano + '-' + mes + '-' + dia
        if (!dataInput.value) dataInput.value = dataAtual
    }

    const [selectedCard, setSelectedCard] = useState(new Set(['Cartão']))
    const selectedValueCard = useMemo(
        () => Array.from(selectedCard).join(', ').replaceAll('_', ' '),
        [selectedCard]
    )

    const [selectedMes, setSelectedMes] = useState(new Set(['Mês']))
    const selectedValueMes = useMemo(
        () => Array.from(selectedMes).join(', ').replaceAll('_', ' '),
        [selectedMes]
    )

    return (
        <div>
            <Button
                className="bg-red-200 mt-2"
                rounded
                shadow
                auto
                color=""
                onPress={handler}
                icon={<GiTakeMyMoney className="text-red-800" size={20} />}
            ></Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        Adicionar despesa&nbsp;
                        <Text b size={18}>
                            no crédito
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <div className="w-full flex items-center justify-between bg-blue-50 rounded-xl px-4 py-2 mb-1">
                        <span className={`font-semibold ${isParcelado ? 'text-blue-600' : 'text-gray-500'}`}>Parcelar</span>
                        <Switch
                            checked={isParcelado}
                            onChange={(e) => setIsParcelado(e.target.checked)}
                            size="lg"
                            color="primary"
                        />
                    </div>
                    {isParcelado && (
                        <Input
                            bordered
                            fullWidth
                            color="primary"
                            size="lg"
                            type="number"
                            min={2}
                            max={60}
                            value={String(numParcelas)}
                            onChange={(e) => {
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val >= 2) setNumParcelas(val)
                            }}
                            labelLeft="#"
                            placeholder="Número de parcelas"
                        />
                    )}
                    <CategoryDropdown
                    selectedValue={selectedValue}
                    onSelect={(cat) => setSelectedValue(cat)}
                    categoryType={"DESPESA"}
                    />

                    <Input
                        disabled={loading || created || invalid ? true : false}
                        bordered
                        maxLength={9}
                        onKeyUp={formatarMoeda}
                        labelLeft="R$"
                        fullWidth
                        color="primary"
                        size="lg"
                        id="valor-despesa-credito"
                        type="float"
                        placeholder="Valor"
                        className="mb-2"
                    />
                    <Input
                        disabled={loading || created || invalid ? true : false}
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        type="date"
                        id="data-despesa-credito"
                        placeholder="Data"
                        onFocus={fillDate}
                    />
                    <Dropdown type='listbox'>
                        <Dropdown.Button bordered color="error" css={{ tt: 'capitalize' }}>
                            {selectedValueMes}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="error"
                            selectionMode="single"
                            selectedKeys={selectedMes}
                            onSelectionChange={setSelectedMes}
                            id="mes"
                            className='h-72'
                        >
                            {meses.map((mes) => (
                                <Dropdown.Item key={mes}>{mes}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <Input
                        disabled={loading || created || invalid ? true : false}
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        type="text"
                        id="descricao-despesa-credito"
                        placeholder="Descrição"
                    />
                    <Dropdown>
                        <Dropdown.Button flat css={{ tt: 'capitalize' }}>
                            {selectedValueCard}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            selectionMode="single"
                            selectedKeys={selectedCard}
                            onSelectionChange={setSelectedCard}
                            id="cartao"
                        >
                            {cartoes.map((cartao) => (
                                <Dropdown.Item key={cartao}>{cartao}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className="w-full flex justify-center space-x-4">
                        <div className="bg-gray-300 rounded-full w-48 flex items-center justify-left">
                            <Switch
                                checked={true}
                                size="xl"
                                color="error"
                                iconOn={<MdAttachMoney className="ml-0.5" />}
                                iconOff={<MdMoneyOffCsred />}
                                className="mb-1 ml-0.5"
                                id="status-despesa-credito"
                            />
                            <p className="ml-6 text-gray-500 font-bold">Pago</p>
                        </div>
                        
                        {!isParcelado && (
                        <div className="bg-gray-300 rounded-full w-32 flex items-center justify-left">
                            <Switch
                                checked={false}
                                size="lg"
                                color="primary"
                                className="mb-1 ml-0.5"
                                id="fixa-despesa-credito"
                            />
                            <p className="ml-2 text-gray-500 font-bold">Fixa</p>
                        </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button auto color={'success'} onPress={getForm}>
                        {created ? (
                            <AiFillCheckCircle size={20} />
                        ) : loading ? (
                            <Loading type="spinner" color="white" size="sm" />
                        ) : invalid ? (
                            <AiFillCheckCircle size={20} />
                        ) : (
                            'Enviar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddExpenseModalCrédito
