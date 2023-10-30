import React, {useState,useEffect} from 'react'
import { BsThreeDots } from 'react-icons/bs'
import { BiRestaurant,BiCar,BiPhone,BiSolidTShirt,BiCreditCardAlt,BiBomb,BiSmile,BiGift,BiMoneyWithdraw } from 'react-icons/bi'
import { GiWeightLiftingUp,GiHealthNormal } from 'react-icons/gi'
import { SiBetfair,SiFreelancer } from 'react-icons/si'
import { AiOutlineTool } from 'react-icons/ai'
import { RiFundsBoxLine,RiBillLine } from 'react-icons/ri'
import { Mov } from './Mov'


const RecentOrders = () => {
  const [mov,setMov] = useState([])

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
      setMov(produto.arrayMov)
    });

  return (
    <div className="w-full col-span-1 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white overflow-scroll">
      <h1>Últimas Movimentações</h1>
      <ul>

        {mov.slice(0).reverse().map((mov,id) => (

          <li key={id} className='bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 flex items-center cursor-pointer'>
            <div className={mov.tipo==='RECEITA' ? 'bg-green-200 rounded-lg p-3' :'bg-red-200 rounded-lg p-3'} >
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
            : mov.descritivo === 'Investimento' ? <RiFundsBoxLine size={20}  className={mov.tipo === 'RECEITA' ? 'text-green-800' : 'text-red-800'}/>
            : mov.descritivo === 'Fatura' ? <RiBillLine size={20} className='text-red-800'/>
            : mov.descritivo === 'Salário' ? <BiMoneyWithdraw size={20}  className='text-green-800'/>
            : mov.descritivo === 'Freelance' ? <SiFreelancer size={20}  className='text-green-800'/>
            : mov.descritivo === 'Limite Cartão' ? <BiCreditCardAlt size={20}  className='text-green-800'/>
            :  <BsThreeDots size={20}  className={mov.tipo === 'RECEITA' ? 'text-green-800' : 'text-red-800'}/>

          }
            </div>
            <div className='pl-4'>
              <p className='text-gray-800 font-extrabold'>R$ {parseFloat(mov.valor).toFixed(2).replace(".", ",")}</p>
              <p className='text-gray-400 text-sm'>{mov.detalhes ? `${mov.detalhes} - `: ''}{mov.conta}{mov.cartao ? ` - ${mov.cartao}` : ''}</p>
            </div>
            <p className='lg:flex md:hidden absolute mb-7 right-6 text-sm'>
            {mov.data}
            </p>
          </li>
        ))}
      </ul>

    </div>
  )
}

export default RecentOrders