import { React,useState } from 'react'
import { Modal, Button, Text, Input } from "@nextui-org/react";

const AddFatura = () => {


    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
  
    const closeHandler = () => {
      setVisible(false)
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
      form.append("valor",valor.value)
      form.append("data",data.value)
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

      <Button  className='text-red-800 bg-red-200 mt-2 -ml-3 -mb-5' size="xs" rounded-sm shadow color='' onPress={handler}>
      Fatura: R$ 400,00
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
            <Text b size={18} color='error'>
              R$ <span id='fatura'>400,00</span>
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

export default AddFatura