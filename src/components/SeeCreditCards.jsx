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
    const formatarMoeda = () => {
      var elemento = document.getElementById('valor')
      var valor = elemento.value
      

      valor = valor + ''
      valor = parseInt(valor.replace(/[\D]+/g, ''))
      valor = valor + ''
      valor = valor.replace(/([0-9]{2})$/g, ",$1")

      if (valor.length > 6) {
          valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2")
      }

      elemento.value = valor;
      if(valor == 'NaN') elemento.value = ''
      
  }

    const getForm =() => {
      var valor = document.getElementById('valor')
      const form = new FormData()
      form.append("tipo","Receita")
      form.append("categoria","Locomoção")
      form.append("valor",valor.value)
      form.append("data",data.value)
      form.append("status","Recebido")
      form.append("conta","Bilhete Único")
      for(let i of form.entries()){
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
      if(!dataInput.value) dataInput.value = dataAtual
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
			<div className='w-28'><Progress value={75}/></div>
		</div>
		<p className='text-right mr-4 text-xs text-gray-400'>R$ 750,00/R$ 1000,00</p>
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