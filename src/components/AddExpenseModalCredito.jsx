import { React,useState,useMemo } from 'react'
import { Switch, Modal, Button, Text, Input, Dropdown } from "@nextui-org/react";
import { GiTakeMyMoney } from 'react-icons/gi'
import { MdMoneyOffCsred,MdAttachMoney } from 'react-icons/md'

const AddExpenseModalCrédito = () => {
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
      let categoria = selectedValue
      let valor = document.getElementById('valor')
      let data = document.getElementById('data')
      let descricao = document.getElementById('descricao')
      let status = document.getElementById('status').getAttribute('data-state') === 'checked' ? 'Pago' : 'A pagar'
      let cartao = selectedValueCard

      const form = new FormData()
      form.append("tipo","Despesa")
      form.append("categoria",categoria)
      form.append("valor",valor.value)
      form.append("data",data.value)
      form.append("descricao",descricao.value)
      form.append("status",status)
      form.append("conta","Cartão de Crédito")
      form.append("cartao",cartao)

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

    const [selected, setSelected] = useState(new Set(["Categoria"]));

    const selectedValue = useMemo(
      () => Array.from(selected).join(", ").replaceAll("_", " "),
      [selected]
    )

    const [selectedCard, setSelectedCard] = useState(new Set(["Cartão"]));

    const selectedValueCard = useMemo(
      () => Array.from(selectedCard).join(", ").replaceAll("_", " "),
      [selectedCard]
    )

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
              no crédito Nubank
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
        <Dropdown>
      <Dropdown.Button flat color="error" css={{ tt: "capitalize" }}>
        {selectedValue}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Single selection actions"
        color="error"
        selectionMode="single"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        id="categoria"
      >
		<Dropdown.Item key="Alimentação">Alimentação</Dropdown.Item>
		<Dropdown.Item key="Locomoção">Locomoção</Dropdown.Item>
		<Dropdown.Item key="Academia">Academia</Dropdown.Item>
		<Dropdown.Item key="Celular">Celular</Dropdown.Item>
		<Dropdown.Item key="Vestuário">Vestuário</Dropdown.Item>
		<Dropdown.Item key="Cartão">Cartão</Dropdown.Item>
		<Dropdown.Item key="Dívida">Dívida</Dropdown.Item>
		<Dropdown.Item key="Lazer">Lazer</Dropdown.Item>
		<Dropdown.Item key="Saúde">Saúde</Dropdown.Item>
		<Dropdown.Item key="Bet">Bet</Dropdown.Item>
		<Dropdown.Item key="Presente">Presente</Dropdown.Item>
		<Dropdown.Item key="Serviços">Serviços</Dropdown.Item>
		<Dropdown.Item key="Investimento">Investimento</Dropdown.Item>
		<Dropdown.Item key="Fatura">Fatura</Dropdown.Item>
		<Dropdown.Item key="Outros">Outros</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
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
            <Input
            bordered
            fullWidth
            color="primary"
            size="lg"
            type="text"
            id="descricao"
            placeholder="Descrição"
          />
                    <Dropdown>
      <Dropdown.Button flat css={{ tt: "capitalize" }}>
        {selectedValueCard}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Single selection actions"
        selectionMode="single"
        selectedKeys={selectedCard}
        onSelectionChange={setSelectedCard}
        id="cartao"
      >
        <Dropdown.Item key="Nubank Caio">Nubank Caio</Dropdown.Item>
        <Dropdown.Item key="Nubank Julia">Nubank Julia</Dropdown.Item>
        <Dropdown.Item key="Neon Julia">Neon Julia</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
          <div className='w-full flex justify-center'>
          <div className='bg-gray-300 rounded-full w-48 h- flex items-center justify-left'>
          <Switch 
          checked={true}
          size="xl"
          color="error"
          iconOn={<MdAttachMoney className='ml-0.5'/>}
          iconOff={<MdMoneyOffCsred/>} 
          className='mb-1 ml-0.5'
          id="status"
          /> 
          <p className='ml-6 text-gray-500 font-bold'>Pago</p>
          </div>
          </div>
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

export default AddExpenseModalCrédito