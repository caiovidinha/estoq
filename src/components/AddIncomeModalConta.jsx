import { React, useState, useMemo, useEffect } from 'react'
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
import {
    AiFillCheckCircle,
    AiFillExclamationCircle,
    AiFillCloseCircle,
} from 'react-icons/ai'
import { MdMoneyOffCsred, MdAttachMoney } from 'react-icons/md'
import { Accounts } from './Accounts'

const AddIncomeModalConta = () => {
    const [invalid, setInvalid] = useState(false)
    const [created, setCreated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [contas, setContas] = useState([])

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
    const closeHandler = () => setVisible(false)

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
        const categoria = selectedValue
        const mes = selectedValueMes

        let valor = document.getElementById('valor').value
        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, ',$1')

        const data = document.getElementById('data').value
        const descricao = document.getElementById('descricao').value
        const conta = selectedValueAccount
        const status =
            document.getElementById('status').getAttribute('data-state') === 'checked'
                ? 'Recebido'
                : 'A receber'

        const post = {
            tipo: 'RECEITA',
            categoria: categoria,
            valor: valor,
            data: data,
            mes: mes,
            descricao: descricao,
            status: status,
            conta: conta,
        }

        setLoading(true)
        const res = await fetch('/api/createTransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        })

        setTimeout(() => {
            setLoading(false)
            setCreated(true)
        }, 700)

        setTimeout(() => {
            setCreated(false)
            setSelected(new Set(['Categoria']))
            setSelectedMes(new Set(['Mês']))
            if (
                document.getElementById('valor').value !== null &&
                document.getElementById('data').value !== null &&
                document.getElementById('descricao').value !== null
            ) {
                document.getElementById('valor').value = ''
                document.getElementById('data').value = ''
                document.getElementById('descricao').value = ''
            }
        }, 1300)
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

    const [selected, setSelected] = useState(new Set(['Categoria']))
    const [selectedMes, setSelectedMes] = useState(new Set(['Mês']))
    const [selectedAccount, setSelectedAccount] = useState(new Set(['Conta']))

    const selectedValue = useMemo(
        () => Array.from(selected).join(', ').replaceAll('_', ' '),
        [selected]
    )
    const selectedValueMes = useMemo(
        () => Array.from(selectedMes).join(', ').replaceAll('_', ' '),
        [selectedMes]
    )
    const selectedValueAccount = useMemo(
        () => Array.from(selectedAccount).join(', ').replaceAll('_', ' '),
        [selectedAccount]
    )

    useEffect(() => {
        const fetchContas = async () => {
            // API para buscar contas
            let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
            let SHEET_TITLE = 'API'
            let SHEET_RANGE = 'O:P'
            let FULL_URL =
                'https://docs.google.com/spreadsheets/d/' +
                SHEET_ID +
                '/gviz/tq?sheet=' +
                SHEET_TITLE +
                '&range=' +
                SHEET_RANGE
            try {
                const res = await fetch(FULL_URL)
                const rep = await res.text()
                let data = JSON.parse(rep.substr(47).slice(0, -2))
                let conta = new Accounts()
                for (let i = 0; i < data.table.rows.length; i++) {
                    conta.salvar(
                        i,
                        data.table.rows[i].c[0].v,
                        data.table.rows[i].c[1].v.toFixed(2)
                    )
                }
                setContas(conta.arrayAccounts)
            } catch (error) {
                console.error('Erro ao buscar contas: ', error)
            }
        }
        fetchContas()
        console.log(contas[1])
    }, [])

    return (
        <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
            <Button
                className="bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10 sm:-ml-3 -ml-5"
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
                    <Dropdown>
                        <Dropdown.Button flat color="success" css={{ tt: 'capitalize' }}>
                            {selectedValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="success"
                            selectionMode="single"
                            selectedKeys={selected}
                            onSelectionChange={setSelected}
                            id="categoria"
                        >
                            <Dropdown.Item key="Salário">Salário</Dropdown.Item>
                            <Dropdown.Item key="Freelance">Freelance</Dropdown.Item>
                            <Dropdown.Item key="Investimento">Investimento</Dropdown.Item>
                            <Dropdown.Item key="Limite Cartão">Limite Cartão</Dropdown.Item>
                            <Dropdown.Item key="Outros">Outros</Dropdown.Item>
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
                            <Dropdown.Item key="01 - JANEIRO">01 - JANEIRO</Dropdown.Item>
                            <Dropdown.Item key="02 - FEVEREIRO">02 - FEVEREIRO</Dropdown.Item>
                            <Dropdown.Item key="03 - MARÇO">03 - MARÇO</Dropdown.Item>
                            <Dropdown.Item key="04 - ABRIL">04 - ABRIL</Dropdown.Item>
                            <Dropdown.Item key="05 - MAIO">05 - MAIO</Dropdown.Item>
                            <Dropdown.Item key="06 - JUNHO">06 - JUNHO</Dropdown.Item>
                            <Dropdown.Item key="07 - JULHO">07 - JULHO</Dropdown.Item>
                            <Dropdown.Item key="08 - AGOSTO">08 - AGOSTO</Dropdown.Item>
                            <Dropdown.Item key="09 - SETEMBRO">09 - SETEMBRO</Dropdown.Item>
                            <Dropdown.Item key="10 - OUTUBRO">10 - OUTUBRO</Dropdown.Item>
                            <Dropdown.Item key="11 - NOVEMBRO">11 - NOVEMBRO</Dropdown.Item>
                            <Dropdown.Item key="12 - DEZEMBRO">12 - DEZEMBRO</Dropdown.Item>
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
                            {contas.map((account) => (
                                <Dropdown.Item key={account.conta}>{account.conta}</Dropdown.Item>
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
                    <p className={invalid ? 'flex text-red-800 items-center' : 'hidden'}>
                        <AiFillCloseCircle className="mr-1" />
                        Preencha todos os campos corretamente
                    </p>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddIncomeModalConta
