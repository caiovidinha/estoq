import { React, useState, useEffect } from 'react'
import { Modal, Button, Text, Card } from '@nextui-org/react'
import { BiSolidBank } from 'react-icons/bi'

const SeeAccounts = () => {
    const [contas, setContas] = useState([])
    const [visible, setVisible] = useState(false)
    
    const handler = () => setVisible(true)
    const closeHandler = () => setVisible(false)

    useEffect(() => {
        const fetchContas = async () => {
            try {
                // Busca contas de API!O:P
                const response = await fetch('/api/contas')
                const result = await response.json()
                
                if (result.success) {
                    setContas(result.data)
                }
            } catch (error) {
                console.error('Erro ao carregar contas:', error)
            }
        }
        
        // Só busca quando o modal é aberto
        if (visible) {
            fetchContas()
        }
    }, [visible])

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
                                {contas.length === 0 ? (
                                    <Text>Nenhuma conta cadastrada</Text>
                                ) : (
                                    contas.map((account, index) => (
                                        <li key={index}>
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <div className="rounded-full p-3 bg-gray-200 my-2">
                                                        <BiSolidBank className="text-gray-700" />
                                                    </div>
                                                    <Text>{account.conta}</Text>
                                                    <div className="w-28">
                                                        <strong>{account.saldo}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )}
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
