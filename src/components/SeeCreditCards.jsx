import { React, useState } from 'react'
import { Modal, Button, Text, Card, Progress, Popover} from '@nextui-org/react'
import { BsCreditCardFill } from 'react-icons/bs'

const SeeCreditCards = () => {
    //API

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'API'
    let SHEET_RANGE = 'A1:H2'
    const [faturaNuCaio, setFaturaNuCaio] = useState([])
    const [faturaNuJulia, setFaturaNuJulia] = useState([])
    const [faturaNeonJulia, setFaturaNeonJulia] = useState([])
    const [limiteNuCaio, setLimiteNuCaio] = useState([])
    const [limiteNuJulia, setLimiteNuJulia] = useState([])
    const [limiteNeonJulia, setLimiteNeonJulia] = useState([])

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
            setLimiteNuCaio(data.table.rows[0].c[1].v.toFixed(2))
            setLimiteNuJulia(data.table.rows[0].c[2].v.toFixed(2))
            setLimiteNeonJulia(data.table.rows[0].c[3].v.toFixed(2))
            setFaturaNuCaio(data.table.rows[0].c[4].v.toFixed(2))
            setFaturaNuJulia(data.table.rows[0].c[5].v.toFixed(2))
            setFaturaNeonJulia(data.table.rows[0].c[6].v.toFixed(2))
        })

    //API

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)

    const closeHandler = () => {
        setVisible(false)
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
                icon={<BsCreditCardFill className="text-blue-800" size={20} />}
            ></Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        Cartões&nbsp;
                        <Text b size={18}>
                            de Crédito
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>
                        <Popover placement="top-start" showArrow={true}>
                        <Popover.Trigger>
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full p-3 bg-purple-200">
                                        <BsCreditCardFill className="text-purple-900" />
                                    </div>
                                    <Text>Nubank Caio</Text>
                                    <div className="w-28">
                                        <Progress
                                            color="secondary"
                                            value={(
                                                ((limiteNuCaio-faturaNuCaio) * 100) /
                                                limiteNuCaio
                                            ).toFixed(1)}
                                        />
                                    </div>
                                </div>
                                <p className="text-right mr-1 text-xs text-gray-400">
                                    R$ {parseFloat(limiteNuCaio-faturaNuCaio).toFixed(2).toString().replace('.',',')} / R$ {parseFloat(limiteNuCaio).toFixed(2).toString().replace('.',',')}
                                </p>
                            </div>
                            </Popover.Trigger>
                                    <Popover.Content>
                                        <div className="text-small font-bold p-4">{'Fatura: R$ '+ faturaNuCaio}</div>
                                    </Popover.Content>
                                    </Popover>

                    <Popover placement="top-start" showArrow={true}>
                        <Popover.Trigger>
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full p-3 bg-purple-200">
                                        <BsCreditCardFill className="text-purple-900" />
                                    </div>
                                    <Text>Nubank Julia</Text>
                                    <div className="w-28">
                                        <Progress
                                            color="secondary"
                                            value={(
                                                ((limiteNuJulia-faturaNuJulia) * 100) /
                                                limiteNuJulia
                                            ).toFixed(1)}
                                        />
                                    </div>
                                </div>
                                <p className="text-right mr-1 text-xs text-gray-400">
                                    R$ {parseFloat(limiteNuJulia-faturaNuJulia).toFixed(2).toString().replace('.',',')} / R$ {parseFloat(limiteNuJulia).toFixed(2).toString().replace('.',',')} 
                                </p>
                            </div>
                            </Popover.Trigger>
                            <Popover.Content>
                                <div className="text-small font-bold p-4">{'Fatura: R$ '+ faturaNuJulia}</div>
                            </Popover.Content>
                            </Popover>

                        <Popover className="-mr-20" placement="top-start" showArrow={true}>
                            <Popover.Trigger>
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="rounded-full p-3 bg-blue-200">
                                        <BsCreditCardFill className="text-blue-900" />
                                    </div>
                                    <Text>Neon Julia</Text>
                                    <div className="w-28">
                                        <Progress
                                            value={(
                                                ((limiteNeonJulia-faturaNeonJulia) * 100) /
                                                limiteNeonJulia
                                            ).toFixed(1)}
                                        />
                                    </div>
                                </div>
                                <p className="text-right mr-1 text-xs text-gray-400">
                                    R$ {parseFloat(limiteNeonJulia-faturaNeonJulia).toFixed(2).toString().replace('.',',')} / R$ {parseFloat(limiteNeonJulia).toFixed(2).toString().replace('.',',')} 
                                </p>
                            </div>
                            </Popover.Trigger>
                            <Popover.Content>
                                <div className="text-small font-bold p-4">{'Fatura: R$ '+ faturaNeonJulia}</div>
                            </Popover.Content>
                            </Popover>
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
