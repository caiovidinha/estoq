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
import CategoryDropdown from '@/components/CategoryDropdown';
import { GiReceiveMoney } from 'react-icons/gi'
import {
    AiFillCheckCircle,
    AiFillExclamationCircle,
    AiFillCloseCircle,
} from 'react-icons/ai'
import { MdMoneyOffCsred, MdAttachMoney } from 'react-icons/md'
import { useMeses, useContas } from '@/hooks/useFormOptions'
import { createTransacao } from '@/services/api'

const AddIncomeModalConta = () => {
    const [selectedValue, setSelectedValue] = useState('Categoria');
    const [invalid, setInvalid] = useState(false)
    const [created, setCreated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Hooks para buscar dados da API
    const { meses } = useMeses()
    const { contas } = useContas()

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
    const closeHandler = () => {
        setVisible(false)
        setError(null)
        setInvalid(false)
    }

    const formatarMoeda = () => {
        var elemento = document.getElementById('valor')
        var valor = elemento.value

        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, '.$1')

        elemento.value = valor
        if (valor === 'NaN') elemento.value = ''
    }

    const getForm = async () => {
        try {
            // Validação
            const categoria = selectedValue
            const mes = selectedValueMes
            const valorInput = document.getElementById('valor').value
            const dataInput = document.getElementById('data').value
            const descricao = document.getElementById('descricao').value
            const conta = selectedValueAccount

            if (!categoria || categoria === 'Categoria' || !mes || mes === 'Mês' || 
                !valorInput || !dataInput || !descricao || !conta || conta === 'Conta') {
                setInvalid(true)
                setTimeout(() => setInvalid(false), 3000)
                return
            }

            // Formatar valor para a API (R$ 150,00)
            let valorNumerico = valorInput.replace(/[\D]+/g, '')
            let valorFormatado = 'R$ ' + (parseFloat(valorNumerico) / 100).toFixed(2).replace('.', ',')

            // Formatar data para DD/MM/YYYY
            const [ano, mesNum, dia] = dataInput.split('-')
            const dataFormatada = `${dia}/${mesNum}/${ano}`

            // Status baseado no switch
            const status = document.getElementById('status').getAttribute('data-state') === 'checked'
                ? 'Recebido'
                : 'A receber'

            const transacao = {
                tipo: 'Receita',
                descritivo: categoria,
                valor: valorFormatado,
                data: dataFormatada,
                mes: mes,
                detalhes: descricao,
                situacao: status,
                conta: conta,
            }

            setLoading(true)
            setError(null)

            await createTransacao(transacao)

            setLoading(false)
            setCreated(true)

            // Limpar formulário após 1.3s
            setTimeout(() => {
                setCreated(false)
                setSelectedMes(new Set(['Mês']))
                setSelectedAccount(new Set(['Conta']))
                setSelectedValue('Categoria')
                document.getElementById('valor').value = ''
                document.getElementById('data').value = ''
                document.getElementById('descricao').value = ''
            }, 1300)

        } catch (err) {
            console.error('Erro ao criar receita:', err)
            setLoading(false)
            setError(err.message || 'Erro ao criar receita')
            setTimeout(() => setError(null), 5000)
        }
    }

    const fillDate = () => {
        const dataInput = document.querySelector('#data')
        var data = new Date()
        var dia = String(data.getDate()).padStart(2, '0')
        var mes = String(data.getMonth() + 1).padStart(2, '0')
        var ano = data.getFullYear()
        const dataAtual = ano + '-' + mes + '-' + dia
        if (!dataInput.value) dataInput.value = dataAtual
    }

    const [selectedMes, setSelectedMes] = useState(new Set(['Mês']))
    const [selectedAccount, setSelectedAccount] = useState(new Set(['Conta']))

    const selectedValueMes = useMemo(
        () => Array.from(selectedMes).join(', ').replaceAll('_', ' '),
        [selectedMes]
    )
    const selectedValueAccount = useMemo(
        () => Array.from(selectedAccount).join(', ').replaceAll('_', ' '),
        [selectedAccount]
    )

    return (
        <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
            <Button
                className="bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10 sm:-ml-3 -ml-5 z-10"
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
                            na conta
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>

                    <CategoryDropdown
                    selectedValue={selectedValue}
                    onSelect={(cat) => setSelectedValue(cat)}
                    categoryType={"RECEITA"}
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
                        id="valor"
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
                        id="data"
                        placeholder="Data"
                        onFocus={fillDate}
                    />
                    <Dropdown type="listbox">
                        <Dropdown.Button bordered color="success" css={{ tt: 'capitalize' }}>
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
                        id="descricao"
                        placeholder="Descrição"
                    />
                    <Dropdown>
                        <Dropdown.Button flat css={{ tt: 'capitalize' }}>
                            {selectedValueAccount}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            selectionMode="single"
                            selectedKeys={selectedAccount}
                            onSelectionChange={setSelectedAccount}
                            id="conta"
                        >
                            {contas.map((conta) => (
                                <Dropdown.Item key={conta}>{conta}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className="w-full flex justify-center">
                        <div className="bg-gray-300 rounded-full w-48 flex items-center justify-left">
                            <Switch
                                checked={true}
                                size="xl"
                                color="success"
                                iconOn={<MdAttachMoney className="ml-0.5" />}
                                iconOff={<MdMoneyOffCsred />}
                                className="mb-1 ml-0.5"
                                id="status"
                            />
                            <p className="ml-6 text-gray-500 font-bold">
                                Recebido
                            </p>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button auto color={invalid ? 'warning' : 'success'} onPress={getForm}>
                        {created ? (
                            <AiFillCheckCircle size={20} />
                        ) : loading ? (
                            <Loading type="spinner" color="white" size="sm" />
                        ) : invalid ? (
                            <AiFillExclamationCircle size={20} />
                        ) : (
                            'Enviar'
                        )}
                    </Button>
                    {invalid && (
                        <p className='flex text-red-800 items-center'>
                            <AiFillCloseCircle className="mr-1" />
                            Preencha todos os campos corretamente
                        </p>
                    )}
                    {error && (
                        <p className='flex text-red-800 items-center'>
                            <AiFillCloseCircle className="mr-1" />
                            {error}
                        </p>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddIncomeModalConta
