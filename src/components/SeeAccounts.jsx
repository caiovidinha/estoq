import { React, useState } from 'react'
import { Modal, Button, Text, Card, Progress, Popover} from '@nextui-org/react'
import { BiSolidBank  } from 'react-icons/bi'
import { Accounts } from './Accounts'

const SeeAccounts = () => {
    //API

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'API'
    let SHEET_RANGE = 'O:P'
    const [contas, setContas] = useState([])

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
            let conta = new Accounts()
            for(let i=0;i<data.table.rows.length;i++){
                conta.salvar(
                i,
                data.table.rows[i].c[0].v,
                data.table.rows[i].c[1].v.toFixed(2)
                )
            }
            setContas(conta.arrayAccounts)

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
                icon={<BiSolidBank  className="text-blue-800" size={20} />}
            ></Button>
            <Modal
                closeButton
                aria-labelledby="modal-title"
                open={visible}
                onClose={closeHandler}
            >
                <Modal.Header>
                    <Text id="modal-title" size={18}>
                        <Text b size={18}>
                            Contas
                        </Text>
                    </Text>
                </Modal.Header>
                <Modal.Body>
                    <Card>
                        <Card.Body>

                            <ul>
                                {contas
                                .slice(0)
                                .map((account,index)=>(<li>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="rounded-full p-3 bg-gray-200 my-2">
                                                <BiSolidBank  className="text-gray-700" />
                                            </div>
                                            <Text>{account.conta}</Text>
                                            <div className="w-28">
                                                <strong>R$ {account.saldo.replace(".",',')}</strong>
                                            </div>
                                        </div>
                                    </div>

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

export default SeeAccounts
