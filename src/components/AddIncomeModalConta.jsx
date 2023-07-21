	import { React,useState,useMemo,useEffect,useRef } from 'react'
	import { Modal, Button, Text, Input, Dropdown, Switch, Loading } from "@nextui-org/react";
	import { GiReceiveMoney } from 'react-icons/gi'
	import { MdMoneyOffCsred,MdAttachMoney } from 'react-icons/md'

	const AddIncomeModalConta = () => {

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
		const valor = parseFloat(document.getElementById('valor').value)
		const data = document.getElementById('data').value
		const descricao = document.getElementById('descricao').value
		const status = document.getElementById('status').getAttribute("data-state") === "checked" ? "Recebido" : "A receber"


		const postData = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				tipo: "Receita",
				categoria: categoria,
				valor: valor,
				data: data,
				descricao: descricao,
				status: status,
				conta: "Conta Nubank"
						})
		}
		setLoading(true)
		const res = await fetch('http://localhost:3000/api/mov',postData)
		if(res.status == 200){
			setLoading(false)
			setCreated(true)
			setSelected(['Categoria'])
			document.getElementById('valor').value = ''
			document.getElementById('data').value = ''
			document.getElementById('descricao').value = ''
		}
		setTimeout(()=>{
			setCreated(false)
		},2000)
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
		<Dropdown.Button flat color="success" css={{ tt: "capitalize" }}>
		{selectedValue}
		</Dropdown.Button>
		<Dropdown.Menu
		aria-label="Single selection actions"
		color="success"
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
			<div className='w-full flex justify-center'>
			<div className='bg-gray-300 rounded-full w-48 h- flex items-center justify-left'>
			<Switch 
			checked={true}
			size="xl"
			color="success"
			iconOn={<MdAttachMoney className='ml-0.5'/>}
			iconOff={<MdMoneyOffCsred />} 
			className='mb-1 ml-0.5'
			id="status"
			/> 
			<p className='ml-6 text-gray-500 font-bold'>Recebido</p>
			</div>
			</div>
		</Modal.Body>
		<Modal.Footer>
			<Button auto flat color="error" onPress={closeHandler}>
			Fechar
			</Button>
			<Button auto color="success" onPress={getForm}>
			{created ? 'Enviado!' : loading ? <Loading type="spinner" color ="white" size="sm" /> : 'Enviar'}
			</Button>
			
		</Modal.Footer>
		</Modal>
	</div>
	)
	}

	export default AddIncomeModalConta