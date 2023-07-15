import { React,useEffect,useState } from 'react'
import { Modal, Button, Text, Card, Progress } from "@nextui-org/react";
import { BsCreditCardFill } from 'react-icons/bs'


const SeeCreditCards = () => {


    //API

    const [limite,setLimite] = useState([])

    async function getLimite() {
			const postData = {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
			const res = await fetch('http://localhost:3000/api/fatura', 
			postData
			)
			const response = await res.json()
            setLimite(response.fatura)
		}

    useEffect(() => {
      getLimite()
    })
    

    //API

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
  
    const closeHandler = () => {
      setVisible(false)
      console.log("closed")
    }

  return (
    <div className='sm:-ml-2 sm:mr-4 ml-3 mr-2'>

      <Button  className='bg-blue-200 flex justify-center items-center mt-2 sm:ml-6 -ml-0.5' auto rounded shadow color='green' onPress={handler} icon={<BsCreditCardFill className='text-blue-800' size={20}/>}>
      
      </Button>
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

        {limite.map((cartao,index)=>{
          return(
          	<div>
              <div className='flex items-center justify-between'>
            <div className='rounded-full p-3 bg-blue-200'><BsCreditCardFill className='text-blue-900'/></div>
            <Text>{cartao.cartao}</Text>
            <div className='w-28'><Progress value={((cartao.valor*100/cartao.limite)).toFixed(1)}/></div>
          </div>
          <p className='text-right mr-4 text-xs text-gray-400'>R$ {cartao.valor.toFixed(2)} / R$ {cartao.limite.toFixed(2)}</p>
          </div>)
        })}

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