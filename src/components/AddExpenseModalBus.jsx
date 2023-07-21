import { React,useState } from 'react'
import { Modal, Button, Text, Input } from "@nextui-org/react";
import { GiTakeMyMoney } from 'react-icons/gi'


const AddExpenseModalBus = () => {
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
		valor = parseFloat(valor.replace(/[\D]+/g, ''))
		valor = valor + ''
		valor = valor.replace(/([0-9]{2})$/g, ".$1")



		elemento.value = valor;
		if(valor == 'NaN') elemento.value = ''
		
	}

    const getForm =() => {
      var valor = document.getElementById('valor')
      const data = document.getElementById('data')

      const form = new FormData()
      form.append("tipo","Despesa")
      form.append("categoria","Locomoção")
      form.append("valor",valor.value)
      form.append("data",data.value)
      form.append("status","Pago")
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
    <div>
      <Button className='bg-red-200 mt-2' rounded shadow auto color='' onPress={handler} icon={<GiTakeMyMoney className='text-red-800' size={20}/>}>

      </Button>
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
            labelLeft='R$'
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

export default AddExpenseModalBus