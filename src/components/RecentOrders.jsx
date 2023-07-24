import React, {useState,useEffect} from 'react'
import { BsThreeDots } from 'react-icons/bs'
import { BiRestaurant,BiCar,BiPhone,BiSolidTShirt,BiCreditCardAlt,BiBomb,BiSmile,BiHealth,BiGift,BiMoneyWithdraw } from 'react-icons/bi'
import { GiWeightLiftingUp } from 'react-icons/gi'
import { SiBetfair,SiFreelancer } from 'react-icons/si'
import { AiOutlineTool } from 'react-icons/ai'
import { RiFundsBoxLine,RiBillLine } from 'react-icons/ri'


const RecentOrders = () => {
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
    <div className="w-full col-span-1 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      <h1>Últimas movimentações</h1>
      <ul>
        {movimentacao.slice(0).reverse().map((mov,id) => (

          <li key={id} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 flex items-center cursor-pointer'>
            <div className={mov.tipo==='Receita' ? 'bg-green-200 rounded-lg p-3' :'bg-red-200 rounded-lg p-3'} >
            { mov.categoria === 'Alimentação' ? <BiRestaurant className='text-red-800'/>
            : mov.categoria === 'Locomoção' ? <BiCar className='text-red-800'/>
            : mov.categoria === 'Academia' ? <GiWeightLiftingUp className='text-red-800'/>
            : mov.categoria === 'Celular' ? <BiPhone className='text-red-800'/>
            : mov.categoria === 'Vestuário' ? <BiSolidTShirt className='text-red-800'/>
            : mov.categoria === 'Cartão' ? <BiCreditCardAlt className='text-red-800'/>
            : mov.categoria === 'Dívida' ? <BiBomb className='text-red-800'/>
            : mov.categoria === 'Lazer' ? <BiSmile className='text-red-800'/>
            : mov.categoria === 'Saúde' ? <BiHealth className='text-red-800'/>
            : mov.categoria === 'Bet' ? <SiBetfair className='text-red-800'/>
            : mov.categoria === 'Presente' ? <BiGift className='text-red-800'/>
            : mov.categoria === 'Serviços' ? <AiOutlineTool className='text-red-800'/>
            : mov.categoria === 'Investimento' ? <RiFundsBoxLine  className={mov.tipo === 'Receita' ? 'text-green-800' : 'text-red-800'}/>
            : mov.categoria === 'Fatura' ? <BiRestaurant className='text-red-800'/>
            : mov.categoria === 'Salário' ? <BiMoneyWithdraw  className='text-green-800'/>
            : mov.categoria === 'Freelance' ? <SiFreelancer  className='text-green-800'/>
            : mov.categoria === 'Limite Cartão' ? <BiCreditCardAlt  className='text-green-800'/>
            :  <BsThreeDots  className={mov.tipo === 'Receita' ? 'text-green-800' : 'text-red-800'}/>
            
          }
            </div>
            <div className='pl-4'>
              <p className='text-gray-800 font-extrabold'>R$ {parseFloat(mov.valor).toFixed(2)}</p>
              <p className='text-gray-400 text-sm'>{mov.descricao}</p>
            </div>
            <p className='lg:flex md:hidden absolute right-6 text-sm'>
            {mov.data ? mov.data.toString().slice(5,7)+'/'+mov.data.toString().slice(8,10)+'/'+mov.data.toString().slice(0,4): ''}
            </p>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default RecentOrders