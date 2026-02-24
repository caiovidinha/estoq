import { React, useState, useMemo } from 'react'
import {
    Modal,
    Button,
    Text,
    Input,
    Dropdown,
    Switch,
    Loading,
} from '@nextui-org/react'
import { GiReceiveMoney } from 'react-icons/gi'
import { AiFillCheckCircle, AiFillExclamationCircle } from 'react-icons/ai'
import { MdAttachMoney, MdMoneyOffCsred } from 'react-icons/md'
import { useMeses } from '@/hooks/useFormOptions'

const AddIncomeModalVR = () => {
    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
    const [loading, setLoading] = useState(false)
    const [created, setCreated] = useState(false)
    const [invalid, setInvalid] = useState(false)
    const [error, setError] = useState(null)

    const { meses } = useMeses()

    const closeHandler = () => {
        setVisible(false)
        setError(null)
        setInvalid(false)
    }

    const formatarMoeda = () => {
        var elemento = document.getElementById('valor-receita-vr')
        var valor = elemento.value

        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, '.$1')

        elemento.value = valor
        if (valor == 'NaN') elemento.value = ''
    }

    const getForm = async () => {
        try {
            const descritivo = selectedValueDescritivo
            const mes = selectedValueMes
            const valorInput = document.getElementById('valor-receita-vr').value
            const dataInput = document.getElementById('data-receita-vr').value
            const descricaoInput = document.getElementById('descricao-receita-vr').value

            if (!descritivo || descritivo === 'Categoria' || !mes || mes === 'Mês' || !valorInput || !dataInput) {
                setInvalid(true)
                setTimeout(() => setInvalid(false), 3000)
                return
            }

            let valorNumerico = valorInput.replace(/[\D]+/g, '')
            let valorFormatado = 'R$ ' + (parseFloat(valorNumerico) / 100).toFixed(2).replace('.', ',')

            const [ano, mesNum, dia] = dataInput.split('-')
            const dataFormatada = `${dia}/${mesNum}/${ano}`

            const status = document.getElementById('status-receita-vr').getAttribute('data-state') === 'checked'
                ? 'Recebido'
                : 'A receber'

            const transacao = {
                tipo: 'RECEITA',
                descritivo: descritivo,
                valor: valorFormatado,
                data: dataFormatada,
                mes: mes,
                detalhes: descricaoInput || '',
                situacao: status,
            }

            setLoading(true)
            setError(null)

            const response = await fetch('/api/transacoes-vr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transacao),
            })

            const result = await response.json()
            setLoading(false)

            if (result.success) {
                setCreated(true)
                setTimeout(() => {
                    setCreated(false)
                    setSelectedDescritivo(new Set(['Categoria']))
                    setSelectedMes(new Set(['Mês']))
                    document.getElementById('valor-receita-vr').value = ''
                    document.getElementById('data-receita-vr').value = ''
                    document.getElementById('descricao-receita-vr').value = ''
                    window.location.reload()
                }, 1300)
            } else {
                setError(result.error || 'Erro ao criar transação')
                setTimeout(() => setError(null), 5000)
            }
        } catch (err) {
            console.error('Erro ao criar crédito VR:', err)
            setLoading(false)
            setError(err.message || 'Erro ao criar transação')
            setTimeout(() => setError(null), 5000)
        }
    }

    const fillDate = () => {
        const dataInput = document.querySelector('#data-receita-vr')
        var data = new Date()
        var dia = String(data.getDate()).padStart(2, '0')
        var mes = String(data.getMonth() + 1).padStart(2, '0')
        var ano = data.getFullYear()
        const dataAtual = ano + '-' + mes + '-' + dia
        if (!dataInput.value) dataInput.value = dataAtual
    }

    const [selectedDescritivo, setSelectedDescritivo] = useState(new Set(['Categoria']))
    const [selectedMes, setSelectedMes] = useState(new Set(['Mês']))

    const selectedValueDescritivo = useMemo(
        () => Array.from(selectedDescritivo).join(', ').replaceAll('_', ' '),
        [selectedDescritivo]
    )
    const selectedValueMes = useMemo(
        () => Array.from(selectedMes).join(', ').replaceAll('_', ' '),
        [selectedMes]
    )

    return (
        <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
            <Button
                className="bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10"
                auto
                rounded
                shadow
                color="green"
                onPress={handler}
                icon={<GiReceiveMoney className="text-green-800" size={20} />}
            ></Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        Adicionar crédito&nbsp;
                        <Text b size={18}>
                            no Vale Benefícios
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Dropdown type="listbox">
                        <Dropdown.Button
                            bordered
                            color="success"
                            css={{ tt: 'capitalize' }}
                        >
                            {selectedValueDescritivo}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Tipo de receita VR"
                            color="success"
                            selectionMode="single"
                            selectedKeys={selectedDescritivo}
                            onSelectionChange={setSelectedDescritivo}
                        >
                            <Dropdown.Item key="Saldo">Saldo</Dropdown.Item>
                            <Dropdown.Item key="Reajuste">Reajuste</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Input
                        disabled={loading || created || invalid ? true : false}
                        bordered
                        maxLength={9}
                        onKeyUp={formatarMoeda}
                        labelLeft="R$"
                        fullWidth
                        color="primary"
                        size="lg"
                        id="valor-receita-vr"
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
                        id="data-receita-vr"
                        placeholder="Data"
                        onFocus={fillDate}
                    />
                    <Dropdown type="listbox">
                        <Dropdown.Button
                            bordered
                            color="success"
                            css={{ tt: 'capitalize' }}
                        >
                            {selectedValueMes}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="success"
                            selectionMode="single"
                            selectedKeys={selectedMes}
                            onSelectionChange={setSelectedMes}
                            id="mes"
                            className="h-72"
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
                        id="descricao-receita-vr"
                        placeholder="Descrição (opcional)"
                    />
                    <div className="w-full flex justify-center space-x-4">
                        <div className="bg-gray-300 rounded-full w-48 flex items-center justify-left">
                            <Switch
                                checked={true}
                                size="xl"
                                color="success"
                                iconOn={<MdAttachMoney className="ml-0.5" />}
                                iconOff={<MdMoneyOffCsred />}
                                className="mb-1 ml-0.5"
                                id="status-receita-vr"
                            />
                            <p className="ml-6 text-gray-500 font-bold">Recebido</p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button
                        auto
                        color={invalid ? 'warning' : 'success'}
                        onPress={getForm}
                    >
                        {created ? (
                            <AiFillCheckCircle size={20} />
                        ) : invalid ? (
                            <AiFillExclamationCircle size={20} />
                        ) : loading ? (
                            <Loading type="spinner" color="white" size="sm" />
                        ) : (
                            'Enviar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddIncomeModalVR
