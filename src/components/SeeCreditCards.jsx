import { React, useState } from 'react'
import { Modal, Button, Text, Card, Progress, Popover} from '@nextui-org/react'
import { BsCreditCardFill } from 'react-icons/bs'
import { Cards } from './Cards'

const SeeCreditCards = () => {
    //API

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'API'
    let SHEET_RANGE = 'J:M'
    const [cartoes, setCartoes] = useState([])

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
            let cartao = new Cards()
            for(let i=0;i<data.table.rows.length;i++){
                cartao.salvar(
                i,
                data.table.rows[i].c[0].v,
                data.table.rows[i].c[1].v,
                data.table.rows[i].c[2].v.toFixed(2),
                data.table.rows[i].c[3].v.toFixed(2)
                )
            }
            setCartoes(cartao.arrayCard)

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

                            <ul>
                                {cartoes
                                .slice(0)
                                .map((card,index)=>(<li key={index}>
                                    <Popover placement="top-start" showArrow={true}>
                                    <Popover.Trigger>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className={card.cartao.split(' ')[0] == 
                                                'Nubank' ? "rounded-full p-3 bg-purple-200" 
                                                : card.cartao.split(' ')[0] == 
                                                'Neon' ? "rounded-full p-3 bg-blue-200"
                                                : "rounded-full p-3 bg-gray-200"}>
                                                <BsCreditCardFill className=
                                                {card.cartao.split(' ')[0] == 
                                                'Nubank' ? "text-purple-900" 
                                                : card.cartao.split(' ')[0] == 
                                                'Neon' ? "text-blue-900"
                                                : "text-gray-700"} />
                                            </div>
                                            <Text>{card.cartao}</Text>
                                            <div className="w-28">
                                                <Progress
                                                    color={(((card.limite-card.fatura) * 100) /card.limite) < 30 ? "error" 
                                                    : (((card.limite-card.fatura) * 100) /card.limite) < 50 ? "warning" 
                                                    : "success"}
                                                    value={(
                                                        ((card.limite-card.fatura) * 100) /
                                                        card.limite
                                                    ).toFixed(1)}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-right mr-1 -mt-1 text-xs text-gray-400">
                                            R$ {parseFloat(card.limite-card.fatura).toFixed(2).toString().replace('.',',')} / R$ {parseFloat(card.limite).toFixed(2).toString().replace('.',',')}
                                        </p>
                                    </div>
                                    </Popover.Trigger>
                                            <Popover.Content>
                                                <div className="text-small font-bold p-4">{'Fatura: R$ '+ card.fatura}</div>
                                            </Popover.Content>
                                    </Popover>
                                </li>))}
                            
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
