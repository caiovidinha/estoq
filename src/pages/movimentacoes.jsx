import React, { useState,useEffect } from 'react'
import Header from '@/components/Header'
import { BsThreeDots } from 'react-icons/bs'
import { BiRestaurant,BiCar,BiPhone,BiSolidTShirt,BiCreditCardAlt,BiBomb,BiSmile,BiGift,BiMoneyWithdraw } from 'react-icons/bi'
import { GiWeightLiftingUp,GiHealthNormal } from 'react-icons/gi'
import { SiBetfair,SiFreelancer } from 'react-icons/si'
import { AiOutlineTool } from 'react-icons/ai'
import { RiFundsBoxLine,RiBillLine } from 'react-icons/ri'
import { Mov } from '@/components/Mov'
import { Modal, Button, Text } from "@nextui-org/react";

const orders = () => {
	const [visible, setVisible] = useState(false)
	const [tipo, setTipo] = useState([])
	const [descritivo, seteDescritivo] = useState([])
	const [valor, setValor] = useState([])
	const [data, setData] = useState([])
	const [mes, setMes] = useState([])
	const [detalhes, setDetalhes] = useState([])
	const [situacao, setSituacao] = useState([])
	const [conta, setConta] = useState([])


    const handler = (tipo,descritivo,valor,data,mes,detalhes,situacao,conta) => {
		setTipo(tipo)
		seteDescritivo(descritivo)
		setValor(valor)
		setData(data)
		setMes(mes)
		setDetalhes(detalhes)
		setSituacao(situacao)
		setConta(conta)
		setVisible(true)
    }
  
    const closeHandler = () => {
      setVisible(false)
    }


	const [movimentacao,setMovimentacao] = useState([])

	let SHEET_ID = "1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE";
	let SHEET_TITLE_MOV = "Extrato";
	let SHEET_RANGE = "A:H";
	let FULL_URL_MOV = ("https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/gviz/tq?sheet=" + SHEET_TITLE_MOV + "&range=" + SHEET_RANGE);
  

	fetch(FULL_URL_MOV)
	.then(res => res.text())
	.then(rep => {
		let data = JSON.parse(rep.substr(47).slice(0,-2))
		let produto = new Mov()
		for(let i = 0;i<data.table.rows.length;i++){
		produto.salvar(data.table.rows[i].c[0].v,data.table.rows[i].c[1].v,data.table.rows[i].c[2].v.toFixed(2),data.table.rows[i].c[3].v,data.table.rows[i].c[4].v,data.table.rows[i].c[5].v,data.table.rows[i].c[6].v,data.table.rows[i].c[7].v)
		}
		setMovimentacao(produto.arrayMov)
		});
	


  return (
	<div className='bg-gray-100 min-h-screen'>	
		<Header />
		<div className='p-4'>
			<div className='w-full m-auto p-4 border rounded-lg overflow-y-auto'>
				<div className='my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 items-center justify-between font-bold'>
					<span>Movimentação</span>
					<span className='sm:text-left text-right'>Status</span>
					<span className='hidden md:grid'>Data</span>
					<span className='hidden sm:grid'>Conta</span>
				</div>
				<ul>
				{movimentacao.slice(0).reverse().map((mov,index) => (
						<li onClick={() => handler(mov.tipo,mov.descritivo,mov.valor,mov.data,mov.mes,mov.detalhes,mov.situacao,mov.conta)} key={index} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer'>
							
							<div className='flex'>
								<div className={mov.tipo==='RECEITA' ? 'bg-green-200 rounded-lg p-3' :'bg-red-200 rounded-lg p-3'}>
								{ mov.descritivo === 'Alimentação' ? <BiRestaurant size={20} className='text-red-800'/>
								: mov.descritivo === 'Locomoção' ? <BiCar size={20} className='text-red-800'/>
								: mov.descritivo === 'Academia' ? <GiWeightLiftingUp size={20} className='text-red-800'/>
								: mov.descritivo === 'Celular' ? <BiPhone size={20} className='text-red-800'/>
								: mov.descritivo === 'Vestuário' ? <BiSolidTShirt size={20} className='text-red-800'/>
								: mov.descritivo === 'Cartão' ? <BiCreditCardAlt size={20} className='text-red-800'/>
								: mov.descritivo === 'Dívida' ? <BiBomb size={20} className='text-red-800'/>
								: mov.descritivo === 'Lazer' ? <BiSmile size={20} className='text-red-800'/>
								: mov.descritivo === 'Saúde' ? <GiHealthNormal size={20} className='text-red-800'/>
								: mov.descritivo === 'Bet' ? <SiBetfair size={20} className='text-red-800'/>
								: mov.descritivo === 'Presente' ? <BiGift size={20} className='text-red-800'/>
								: mov.descritivo === 'Serviços' ? <AiOutlineTool size={20} className='text-red-800'/>
								: mov.descritivo === 'Investimento' ? <RiFundsBoxLine size={20}  className={mov.tipo === 'Receita' ? 'text-green-800' : 'text-red-800'}/>
								: mov.descritivo === 'Fatura' ? <RiBillLine size={20} className='text-red-800'/>
								: mov.descritivo === 'Salário - V4' ? <BiMoneyWithdraw size={20}  className='text-green-800'/>
								: mov.descritivo === 'Freelance' ? <SiFreelancer size={20}  className='text-green-800'/>
								: mov.descritivo === 'Limite Cartão' ? <BiCreditCardAlt size={20}  className='text-green-800'/>
								:  <BsThreeDots size={20}  className={mov.tipo === 'RECEITA' ? 'text-green-800' : 'text-red-800'}/>

							}
								</div>
								<div className='pl-2'>
									<p className='text-gray-800 font-bold text-xs'>R$ {parseFloat(mov.valor).toFixed(2).replace(".", ",")}</p>
									<p className='text-gray-800 text-sm lg:hidden'>{mov.detalhes.length >= 9 ? mov.detalhes.slice(0,7) + '...' : mov.detalhes}</p>
									<p className='text-gray-800 text-sm hidden lg:block'>{mov.detalhes}</p>
								</div>
							</div>
							<p className='text-gray-600 sm:text-left text-right'>
								<select key={index} className={
									mov.situacao == 'Recebido' 
									? 'bg-green-200 p-1 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer' 
									: mov.situacao == 'Pago' 
									? 'bg-red-200 p-1 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer' 
									: 'bg-yellow-200 p-1 rounded-lg hover:bg-yellow-400 text-yellow-800 font-semibold hover:cursor-pointer'
										}>
										<option value={mov.situacao}>{mov.situacao}</option>
										<option value={mov.situacao == 'Recebido' 
										? 'A receber' : mov.situacao == 'A receber' ? 'Recebido' 
										: mov.situacao == 'Pago' ? 'A pagar' 
										: 'Pago'}>
										{mov.situacao == 'Recebido' 
										? 'A receber' : mov.situacao == 'A receber' ? 'Recebido' 
										: mov.situacao == 'Pago' ? 'A pagar' 
										: 'Pago'}
										</option>
								</select>
							</p>
							<p className='hidden md:flex'>
							{mov.data}
							</p>
							<div className='sm:flex hidden justify-between items-center'>
								<p>{mov.conta}{mov.cartao ? ` - ${mov.cartao}` : ''}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
		<div>
				<Modal
				closeButton
				aria-labelledby="modal-title"
				open={visible}
				onClose={closeHandler}
			>
						<Modal.Header>
							
						<Text id="modal-title" size={18}>
							<Text b size={18}>
							Movimentação: {tipo}
							</Text>
						</Text>
						</Modal.Header>
						<Modal.Body className='text-center'>

							
							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="descritivo">
							<Text b size={18}>
							Categoria:
							</Text>
							{' ' + descritivo}
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="valor">
							<Text b size={18}>
							Valor:
							</Text>
								{' ' + valor}
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="data">
							<Text b size={18}>
							Data:
							</Text>
								{' ' + data}
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="mes">
							<Text b size={18}>
							Mês/Fatura:
							</Text>
								{' ' + mes}	
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="detalhes">
							<Text b size={18}>
							Detalhes:
							</Text>
								{' ' + detalhes}
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="situacao">
							<Text b size={18}>
							Situação:
							</Text>
								{' ' + situacao}
							</Text>
							</div>

							<div className='bg-gray-100 rounded-lg -my-1 p-3 grid'>
							<Text id="conta">
							<Text b size={18}>
							Conta:
							</Text>
								{' ' + conta}
							</Text>
							</div>

						</Modal.Body>
						<Modal.Footer>
							<Button auto flat color="error" onPress={closeHandler}>
								Fechar
							</Button>
						</Modal.Footer>
			</Modal>
    </div>
    </div>
	
  )
}

export default orders