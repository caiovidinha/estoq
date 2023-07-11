import { React,useState,useMemo } from 'react'
import { Modal, Button, Text, Input, Dropdown } from "@nextui-org/react";
import { GiReceiveMoney } from 'react-icons/gi'

const AddIncomeModalConta = () => {


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
      var categoria = document.getElementById('categoria')
      var valor = document.getElementById('valor')
      var data = document.getElementById('data')

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

    const [selected, setSelected] = useState(new Set(["text"]));

    const selectedValue = useMemo(
      () => Array.from(selected).join(", ").replaceAll("_", " "),
      [selected]
    );

  return (
    <div className='sm:-ml-2 sm:mr-4 ml-3 mr-2'>

      <Button  className='bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10' auto rounded shadow color='green' onPress={handler} icon={<GiReceiveMoney className='text-green-800' size={20}/>}>
      
      </Button>
      <Modal
        closeButton
        aria-labelledby="modal-title"
        open={visible}
        onClose={closeHandler}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Adicionar receita&nbsp;
            <Text b size={18}>
              na conta Nubank
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
        <Dropdown>
      <Dropdown.Button flat color="success" className='text-left' css={{ tt: "capitalize" }}>
        {selectedValue}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Single selection actions"
        color="success"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        id="categoria"
      >
        <Dropdown.Item key="Salário - V4">Salário - V4</Dropdown.Item>
        <Dropdown.Item key="Freelance">Freelance</Dropdown.Item>
        <Dropdown.Item key="Investimento">Investimento</Dropdown.Item>
        <Dropdown.Item key="Limite Cartão">Limite Cartão</Dropdown.Item>
        <Dropdown.Item key="outros">Outros</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
          <Input
            clearable
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
            <Input
            bordered
            fullWidth
            color="primary"
            size="lg"
            type="text"
            id="descricao"
            placeholder="Descrição"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onPress={closeHandler}>
            Fechar
          </Button>
          <Button auto onPress={getForm}>
            Enviar
          </Button>
          
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddIncomeModalConta