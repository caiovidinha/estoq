import { React, useState, useMemo } from 'react'
import { Switch, Modal, Button, Text, Input, Dropdown, Loading } from "@nextui-org/react";
import { GiTakeMyMoney } from 'react-icons/gi'
import { AiFillCheckCircle } from 'react-icons/ai'
import { MdMoneyOffCsred, MdAttachMoney } from 'react-icons/md'

const AddExpenseModalConta = () => {


  
    let SHEET_ID = "1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE";
    let SHEET_TITLE_MOV = "Extrato";
    let myAPIkey = "AIzaSyC1ro5ya1psdSEfzdNsdafa9vM4mkmA0bE"
    let SHEET_RANGE = "A:H";
    const FULL_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A%3AH:append?includeValuesInResponse=true&insertDataOption=INSERT_ROWS&valueInputOption=RAW&key=${myAPIkey}`
    const [created,setCreated] = useState(false)
    const [loading,setLoading] = useState(false)

    const [visible, setVisible] = useState(false)
    const handler = () => setVisible(true)
  
    const closeHandler = () => {
      setVisible(false)
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

  const getForm = async () => {

		const categoria = selectedValue
    const mes = selectedValueMes
		const valor = parseFloat(document.getElementById('valor').value)
		const data = document.getElementById('data').value
		const descricao = document.getElementById('descricao').value
		const status = document.getElementById('status').getAttribute("data-state") === "checked" ? "Pago" : "A pagar"


		// const postData = {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({
		// 		tipo: "Despesa",
		// 		categoria: categoria,
		// 		valor: valor,
		// 		data: data,
		// 		descricao: descricao,
		// 		status: status,
		// 		conta: "Conta Nubank"
		// 				})
		// }
    const postData = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
        "Authorization": "Bearer 117008714325-n9hprhqoqegnd3fvr878jaegn1ogpv3g.apps.googleusercontent.com"
			},
			body: {
        "values": [
          [
            "Despesa",
            categoria,
            valor,
            data,
            mes,
            descricao,
            status,
            "Conta Nubank"
          ]
        ]
      }
		}
		setLoading(true)
		const res = await fetch(FULL_URL,postData)
		if(res.status == 200){
			setLoading(false)
			setCreated(true)
		}
		setTimeout(()=>{
			setCreated(false)
      setSelected(['Categoria'])
      setSelectedMes(['Mês'])
			if(document.getElementById('valor').value !== null && document.getElementById('data').value !== null && document.getElementById('descricao').value !== null){
        document.getElementById('valor').value = ''
        document.getElementById('data').value = ''
        document.getElementById('descricao').value = ''
        }
		},1300)
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

    const [selectedMes, setSelectedMes] = useState(new Set(["Mês"]));

    const selectedValue = useMemo(
      () => Array.from(selected).join(", ").replaceAll("_", " "),
      [selected]
    );
    const selectedValueMes = useMemo(
      () => Array.from(selectedMes).join(", ").replaceAll("_", " "),
      [selectedMes]
    );
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
              na conta Nubank
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
      			disabled = {loading || created ? true : false}
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
      			disabled = {loading || created ? true : false}
            bordered
            fullWidth
            color="primary"
            size="lg"
            type="date"
            id="data"
            placeholder="Data"
            onFocus={fillDate}
          />
          <Dropdown>
      <Dropdown.Button bordered color="error" css={{ tt: "capitalize" }}>
        {selectedValueMes}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Single selection actions"
        color="error"
        selectionMode="single"
        selectedKeys={selectedMes}
        onSelectionChange={setSelectedMes}
        id="mes"
      >
		<Dropdown.Item key="01 - JANEIRO">01 - JANEIRO</Dropdown.Item>
		<Dropdown.Item key="02 - FEVEREIRO">02 - FEVEREIRO</Dropdown.Item>
		<Dropdown.Item key="03 - MARÇO">03 - MARÇO</Dropdown.Item>
		<Dropdown.Item key="04 - ABRIL">04 - ABRIL</Dropdown.Item>
		<Dropdown.Item key="05 - MAIO">05 - MAIO</Dropdown.Item>
		<Dropdown.Item key="06 - JUNHO">06 - JUNHO</Dropdown.Item>
		<Dropdown.Item key="07 - JULHO">07 - JULHO</Dropdown.Item>
		<Dropdown.Item key="08 - AGOSTO">08 - AGOSTO</Dropdown.Item>
		<Dropdown.Item key="09 - SETEMBRO">09 - SETEMBRO</Dropdown.Item>
		<Dropdown.Item key="10 - OUTUBRO">10 - OUTUBRO</Dropdown.Item>
		<Dropdown.Item key="11 - NOVEMBRO">11 - NOVEMBRO</Dropdown.Item>
		<Dropdown.Item key="12 - DEZEMBRO">12 - DEZEMBRO</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
            <Input
      			disabled = {loading || created ? true : false}  
            bordered
            fullWidth
            color="primary"
            size="lg"
            type="text"
            id="descricao"
            placeholder="Descrição"
          />
    
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
          {created ? <AiFillCheckCircle size={20} />  : loading ? <Loading type="spinner" color ="white" size="sm" /> : 'Enviar'}
          </Button>
          
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddExpenseModalConta