import { React, useState, useMemo } from 'react'
import {
    Modal,
    Button,
    Text,
    Input,
    Dropdown,
    Loading,
} from '@nextui-org/react'
import { GiReceiveMoney } from 'react-icons/gi'
import { AiFillCheckCircle, AiFillExclamationCircle } from 'react-icons/ai'
import { useMeses } from '@/hooks/useFormOptions'
// REMOVIDO: import { createTransacao } from '@/services/api'

const AddIncomeModalBus = () => {
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
        var elemento = document.getElementById('valor-receita-bus')
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
            const mes = selectedValueMes
            const valorInput = document.getElementById('valor-receita-bus').value
            const dataInput = document.getElementById('data-receita-bus').value

            if (!mes || mes === 'Mês' || !valorInput || !dataInput) {
                setInvalid(true)
                setTimeout(() => setInvalid(false), 3000)
                return
            }

            // Formata valor
            let valorNumerico = valorInput.replace(/[\D]+/g, '')
            let valorFormatado = 'R$ ' + (parseFloat(valorNumerico) / 100).toFixed(2).replace('.', ',')

            // Formata data
            const [ano, mesNum, dia] = dataInput.split('-')
            const dataFormatada = `${dia}/${mesNum}/${ano}`

            // Transação de RECEITA (recarga do cartão)
            const transacaoReceita = {
                tipo: 'Receita',
                descritivo: 'Limite Cartão',
                valor: valorFormatado,
                data: dataFormatada,
                mes: mes,
                detalhes: 'Recarga RioCard',
                situacao: 'Recebido',
                conta: 'Bilhete Único',
            }

            // Transação de DESPESA (débito na conta)
            const transacaoDespesa = {
                tipo: 'Despesa',
                descritivo: 'Cartão',
                valor: valorFormatado,
                data: dataFormatada,
                mes: mes,
                detalhes: 'Recarga RioCard',
                situacao: 'Pago',
                conta: 'Conta Nubank',
            }

            setLoading(true)
            setError(null)

            // Cria ambas transações
            await createTransacao(transacaoReceita)
            await createTransacao(transacaoDespesa)

            setLoading(false)
            setCreated(true)

            setTimeout(() => {
                setCreated(false)
                setSelectedMes(new Set(['Mês']))
                document.getElementById('valor-receita-bus').value = ''
                document.getElementById('data-receita-bus').value = ''
            }, 1300)

        } catch (err) {
            console.error('Erro ao criar transações:', err)
            setLoading(false)
            setError(err.message || 'Erro ao criar transações')
            setTimeout(() => setError(null), 5000)
        }
    }

    const fillDate = () => {
        const dataInput = document.querySelector('#data-receita-bus')
        var data = new Date()
        var dia = String(data.getDate()).padStart(2, '0')
        var mes = String(data.getMonth() + 1).padStart(2, '0')
        var ano = data.getFullYear()
        const dataAtual = ano + '-' + mes + '-' + dia
        if (!dataInput.value) dataInput.value = dataAtual
    }

    const [selectedMes, setSelectedMes] = useState(new Set(['Mês']))

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
                        Adicionar receita&nbsp;
                        <Text b size={18}>
                            no RioCard
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Input
                        disabled={loading || created || invalid ? true : false}
                        bordered
                        maxLength={9}
                        onKeyUp={formatarMoeda}
                        labelLeft="R$"
                        fullWidth
                        color="primary"
                        size="lg"
                        id="valor-receita-bus"
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
                        id="data-receita-bus"
                        placeholder="Data"
                        onFocus={fillDate}
                    />
                    <Dropdown type='listbox'>
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
                            className='h-72'
                        >
                            {meses.map((mes) => (
                                <Dropdown.Item key={mes}>{mes}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button
                        auto
                        color={created ? 'success' : invalid ? 'warning' : error ? 'error' : 'success'}
                        onPress={getForm}
                    >
                        {created ? (
                            <AiFillCheckCircle size={20} />
                        ) : invalid ? (
                            <AiFillExclamationCircle size={20} />
                        ) : loading ? (
                            <Loading type="spinner" color="white" size="sm" />
                        ) : error ? (
                            'Erro'
                        ) : (
                            'Enviar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddIncomeModalBus
