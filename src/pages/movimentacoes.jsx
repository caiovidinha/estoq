import React, { useState,useEffect } from 'react'
import Header from '@/components/Header'
import { BsThreeDots } from 'react-icons/bs'
import { BiRestaurant,BiCar,BiPhone,BiSolidTShirt,BiCreditCardAlt,BiBomb,BiSmile,BiGift,BiMoneyWithdraw } from 'react-icons/bi'
import { GiWeightLiftingUp,GiHealthNormal } from 'react-icons/gi'
import { SiBetfair,SiFreelancer } from 'react-icons/si'
import { AiOutlineTool } from 'react-icons/ai'
import { RiFundsBoxLine,RiBillLine } from 'react-icons/ri'

const orders = () => {

	const [movimentacao,setMovimentacao] = useState([])

	async function getMovimentacao() {
		const postData = {
		method: "GET",
		headers: {
		"Content-Type": "application/json",
		},
		}
		const res = await fetch('http://localhost:3000/api/mov', 
		postData
		)
		const response = await res.json()
		setMovimentacao(response.movimentacoes)
	}
	
	useEffect(() => {
		getMovimentacao()
	})

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
						<li key={index} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer'>
							<div className='flex'>
								<div className={mov.tipo==='Receita' ? 'bg-green-200 rounded-lg p-3' :'bg-red-200 rounded-lg p-3'}>
								{ mov.categoria === 'Alimentação' ? <BiRestaurant size={20} className='text-red-800'/>
								: mov.categoria === 'Locomoção' ? <BiCar size={20} className='text-red-800'/>
								: mov.categoria === 'Academia' ? <GiWeightLiftingUp size={20} className='text-red-800'/>
								: mov.categoria === 'Celular' ? <BiPhone size={20} className='text-red-800'/>
								: mov.categoria === 'Vestuário' ? <BiSolidTShirt size={20} className='text-red-800'/>
								: mov.categoria === 'Cartão' ? <BiCreditCardAlt size={20} className='text-red-800'/>
								: mov.categoria === 'Dívida' ? <BiBomb size={20} className='text-red-800'/>
								: mov.categoria === 'Lazer' ? <BiSmile size={20} className='text-red-800'/>
								: mov.categoria === 'Saúde' ? <GiHealthNormal size={20} className='text-red-800'/>
								: mov.categoria === 'Bet' ? <SiBetfair size={20} className='text-red-800'/>
								: mov.categoria === 'Presente' ? <BiGift size={20} className='text-red-800'/>
								: mov.categoria === 'Serviços' ? <AiOutlineTool size={20} className='text-red-800'/>
								: mov.categoria === 'Investimento' ? <RiFundsBoxLine size={20}  className={mov.tipo === 'Receita' ? 'text-green-800' : 'text-red-800'}/>
								: mov.categoria === 'Fatura' ? <RiBillLine size={20} className='text-red-800'/>
								: mov.categoria === 'Salário' ? <BiMoneyWithdraw size={20}  className='text-green-800'/>
								: mov.categoria === 'Freelance' ? <SiFreelancer size={20}  className='text-green-800'/>
								: mov.categoria === 'Limite Cartão' ? <BiCreditCardAlt size={20}  className='text-green-800'/>
								:  <BsThreeDots size={20}  className={mov.tipo === 'Receita' ? 'text-green-800' : 'text-red-800'}/>

							}
								</div>
								<div className='pl-4'>
									<p className='text-gray-800 font-bold'>R$ {parseFloat(mov.valor).toFixed(2).replace(".", ",")}</p>
									<p className='text-gray-800 text-sm'>{mov.descricao}</p>
								</div>
							</div>
							<p className='text-gray-600 sm:text-left text-right'>
								<select key={index} className={
									mov.status == 'Recebido' 
									? 'bg-green-200 p-2 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer' 
									: mov.status == 'Pago' 
									? 'bg-red-200 p-2 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer' 
									: 'bg-yellow-200 p-2 rounded-lg hover:bg-yellow-400 text-yellow-800 font-semibold hover:cursor-pointer'
										}>
										<option value={mov.status}>{mov.status}</option>
										<option value={mov.status == 'Recebido' 
										? 'A receber' : mov.status == 'A receber' ? 'Recebido' 
										: mov.status == 'Pago' ? 'A pagar' 
										: 'Pago'}>
										{mov.status == 'Recebido' 
										? 'A receber' : mov.status == 'A receber' ? 'Recebido' 
										: mov.status == 'Pago' ? 'A pagar' 
										: 'Pago'}
										</option>
								</select>
							</p>
							<p className='hidden md:flex'>
							{mov.data ? mov.data.toString().slice(5,7)+'/'+mov.data.toString().slice(8,10)+'/'+mov.data.toString().slice(0,4): ''}
							</p>
							<div className='sm:flex hidden justify-between items-center'>
								<p>{mov.conta}{mov.cartao ? ` - ${mov.cartao}` : ''}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
    </div>
  )
}

export default orders