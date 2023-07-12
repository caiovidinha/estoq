import { React,useState } from 'react'
import { Modal, Button, Text, Card, Progress } from "@nextui-org/react";
import { BsCreditCardFill } from 'react-icons/bs'


const SeeCreditCards = () => {
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
		<div>
        <div className='flex items-center justify-around'>
			<div className='rounded-full p-3 bg-purple-200'><BsCreditCardFill className='text-purple-900'/></div>
			<Text>Nubank Caio</Text>
			<div className='w-28'><Progress value={50}/></div>
		</div>
		<p className='text-right mr-4 text-xs text-gray-400'>R$ 500,00/R$ 1000,00</p>
		</div>
		
		<div>
        <div className='flex items-center justify-around'>
			<div className='rounded-full p-3 bg-purple-200'><BsCreditCardFill className='text-purple-900'/></div>
			<Text>Nubank Julia</Text>
			<div className='w-28'><Progress value={20}/></div>
		</div>
		<p className='text-right mr-4 text-xs text-gray-400'>R$ 200,00/R$ 1000,00</p>
		</div>

		<div>
        <div className='flex items-center justify-around -ml-0.5'>
			<div className='rounded-full p-3 bg-blue-200'><BsCreditCardFill className='text-blue-900'/></div>
			<Text >Neon Julia</Text>
			<div className='w-28'><Progress value={70}/></div>
		</div>
		<p className='text-right mr-4 text-xs text-gray-400'>R$ 700,00/R$ 1000,00</p>
		</div>
		
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