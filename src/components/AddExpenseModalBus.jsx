import { React, useState, useMemo } from 'react'
import {
    Modal,
    Button,
    Text,
    Input,
    Dropdown,
    Loading,
} from '@nextui-org/react'
import { GiTakeMyMoney } from 'react-icons/gi'
import { AiFillCheckCircle } from 'react-icons/ai'

const AddExpenseModalBus = () => {
    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
    const [loading, setLoading] = useState(false)
    const [created, setCreated] = useState(false)

    const closeHandler = () => {
        setVisible(false)
    }
    const formatarMoeda = () => {
        var elemento = document.getElementById('valor')
        var valor = elemento.value

        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, '.$1')

        elemento.value = valor
        if (valor == 'NaN') elemento.value = ''
    }

    const getForm = async () => {
        const mes = selectedValueMes

        let valor = document.getElementById('valor').value
        valor = valor + ''
        valor = parseFloat(valor.replace(/[\D]+/g, ''))
        valor = valor + ''
        valor = valor.replace(/([0-9]{2})$/g, ',$1')

        const data = document.getElementById('data').value

        const post = {
            tipo: 'DESPESA',
            categoria: 'Locomoção',
            valor: `-${valor}`,
            data: data,
            mes: mes,
            descricao: 'Ônibus',
            status: 'Pago',
            conta: 'Bilhete Único',
        }

        setLoading(true)
        const res = await fetch(
            'https://hooks.zapier.com/hooks/catch/11052334/380w6ti/',
            {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            }
        )

        setTimeout(() => {
            setLoading(false)
            setCreated(true)
        }, 700)

        setTimeout(() => {
            setCreated(false)
            setSelectedMes(['Mês'])
            document.getElementById('valor').value = ''
            document.getElementById('data').value = ''
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
                            no RioCard
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Input
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
                        bordered
                        fullWidth
                        color="primary"
                        size="lg"
                        type="date"
                        id="data"
                        placeholder="Data"
                        onFocus={fillDate}
                    />
                    <Dropdown type='listbox'>
                        <Dropdown.Button
                            bordered
                            color="error"
                            css={{ tt: 'capitalize' }}
                        >
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
                            <Dropdown.Item key="01 - JANEIRO">
                                01 - JANEIRO
                            </Dropdown.Item>
                            <Dropdown.Item key="02 - FEVEREIRO">
                                02 - FEVEREIRO
                            </Dropdown.Item>
                            <Dropdown.Item key="03 - MARÇO">
                                03 - MARÇO
                            </Dropdown.Item>
                            <Dropdown.Item key="04 - ABRIL">
                                04 - ABRIL
                            </Dropdown.Item>
                            <Dropdown.Item key="05 - MAIO">
                                05 - MAIO
                            </Dropdown.Item>
                            <Dropdown.Item key="06 - JUNHO">
                                06 - JUNHO
                            </Dropdown.Item>
                            <Dropdown.Item key="07 - JULHO">
                                07 - JULHO
                            </Dropdown.Item>
                            <Dropdown.Item key="08 - AGOSTO">
                                08 - AGOSTO
                            </Dropdown.Item>
                            <Dropdown.Item key="09 - SETEMBRO">
                                09 - SETEMBRO
                            </Dropdown.Item>
                            <Dropdown.Item key="10 - OUTUBRO">
                                10 - OUTUBRO
                            </Dropdown.Item>
                            <Dropdown.Item key="11 - NOVEMBRO">
                                11 - NOVEMBRO
                            </Dropdown.Item>
                            <Dropdown.Item key="12 - DEZEMBRO">
                                12 - DEZEMBRO
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button auto color="success" onPress={getForm}>
                        {created ? (
                            <AiFillCheckCircle size={20} />
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

export default AddExpenseModalBus
