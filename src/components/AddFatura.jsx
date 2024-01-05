import { React, useState, useMemo, useEffect } from 'react'
import { Modal, Button, Text, Input, Dropdown } from '@nextui-org/react'

const AddFatura = () => {
    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'API'
    let SHEET_RANGE = 'A1:H2'

    let FULL_URL =
        'https://docs.google.com/spreadsheets/d/' +
        SHEET_ID +
        '/gviz/tq?sheet=' +
        SHEET_TITLE +
        '&range=' +
        SHEET_RANGE

    fetch(FULL_URL)
        .then((res) => res.text())
        .then((rep) => {
            let data = JSON.parse(rep.substr(47).slice(0, -2))
            setFaturaNuCaio(data.table.rows[0].c[4].v.toFixed(2))
            setFaturaNuJulia(data.table.rows[0].c[5].v.toFixed(2))
            setFaturaNeonJulia(data.table.rows[0].c[6].v.toFixed(2))
        })

    let valores = 0
    const [fatura, setFatura] = useState([])
    const [faturaNuCaio, setFaturaNuCaio] = useState([])
    const [faturaNuJulia, setFaturaNuJulia] = useState([])
    const [faturaNeonJulia, setFaturaNeonJulia] = useState([])

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)

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

    const getForm = () => {
        let valor = document.getElementById('valor')
        let cartao = selectedValueCard
        let data = document.getElementById('data')

        const form = new FormData()
        form.append('valor', valor.value)
        form.append('data', data.value)
        form.append('conta', 'Cartão de Crédito')
        form.append('cartao', cartao)
        for (let i of form.entries()) {
            console.log(i)
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

    const [selectedCard, setSelectedCard] = useState(new Set(['Cartão']))

    const selectedValueCard = useMemo(
        () => Array.from(selectedCard).join(', ').replaceAll('_', ' '),
        [selectedCard]
    )

    async function getFatura() {
        const postData = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const res = await fetch('http://localhost:3000/api/fatura', postData)
        const response = await res.json()
        setFatura(response.fatura)
    }

    useEffect(() => {
        getFatura()
    })

    return (
        <div className="sm:-ml-2 sm:mr-4 ml-3 mr-2">
            <Button
                className="text-red-800 bg-red-200 mt-2 -ml-3 -mb-5"
                size="xs"
                shadow
                color=""
                onPress={handler}
            >
                Fatura:
                {' R$ '}
                {(parseFloat(faturaNeonJulia) +
                    parseFloat(faturaNuJulia) +
                    parseFloat(faturaNuCaio)).toFixed(2).toString().replace('.',',')}
            </Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={16}>
                        Pagar fatura&nbsp;
                        <Text b size={18}>
                            do Nubank
                        </Text>
                        <br /> Fatura atual:&nbsp;
                        <Text b size={18} color="error">
                            R${' '}
                            <span id="fatura">
                                {(parseFloat(faturaNeonJulia) +
                                    parseFloat(faturaNuJulia) +
                                    parseFloat(faturaNuCaio)).toFixed(2).toString().replace('.',',')}
                            </span>
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
                            <Dropdown.Item key="Nubank Caio">
                                Nubank Caio
                            </Dropdown.Item>
                            <Dropdown.Item key="Nubank Julia">
                                Nubank Julia
                            </Dropdown.Item>
                            <Dropdown.Item key="Neon Julia">
                                Neon Julia
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Modal.Body>
                <Modal.Footer>
                    <Button auto flat color="error" onPress={closeHandler}>
                        Fechar
                    </Button>
                    <Button auto color="success" onPress={getForm}>
                        Enviar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddFatura
