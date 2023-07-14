import { React,useEffect,useState,useRef } from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { BsBusFrontFill, } from 'react-icons/bs'
import { SiNubank } from 'react-icons/si'
import AddIncomeModalConta from './AddIncomeModalConta'
import AddExpenseModalConta from './AddExpenseModalConta'
import AddIncomeModalCredito from './AddIncomeModalCredito'
import AddExpenseModalCredito from './AddExpenseModalCredito'
import AddIncomeModalBus from './AddIncomeModalBus'
import AddExpenseModalBus from './AddExpenseModalBus'
import AddInvestimento from './AddInvestimento'
import AddFatura from './AddFatura'
import SeeCreditCards from './SeeCreditCards'

const TopCards = () => {
        let cartoes = 0
        const tipoRef = useRef()
		const categoriaRef = useRef()
		const valorRef = useRef()
		const dataRef = useRef()
		const descricaoRef = useRef()
		const statusRef = useRef()
		const categoraRef = useRef()
		const contaRef = useRef()

		const [saldo,setSaldo] = useState([])

		const [updated,setUpdated] = useState(false)
		const [created,setCreated] = useState(false)
		const [deleted,setDeleted] = useState(false)

		const [updatedError,setUpdatedError] = useState(false)
		const [deletedError,setDeletedError] = useState(false)

		async function addMov() {}

		async function getSaldo() {
			const postData = {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
			const res = await fetch('https://cashflow-git-master-caiovidinha.vercel.app/api/saldo', 
			postData
			)
			const response = await res.json()
            setSaldo(response.saldo)
            
		}

		async function updateMov() {}

		async function deleteMov() {}

		useEffect(() => {
			getSaldo()
            
		})
  return (
    <div className='grid lg:grid-cols-6 gap-4 p-4'>
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <SiNubank size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>
                    {saldo.map((conta,index) => {
                        return(
                            conta.id === 1 ? "R$ " + conta.valor.toFixed(2) : ''
                        )
                    })}
                </p>
                <p className='text-gray-600 sm:text-md text-xs'>Conta Nubank</p>
                <AddInvestimento />
            </div>
        <div className='flex w-[130px] justify-between'>
            <AddIncomeModalConta />
            <AddExpenseModalConta />
        </div>
        </div>
        
        
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BiLogoMastercard size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>
                    {saldo.map((conta,index) => {
                        
                        cartoes += conta.valor

                        return(
                            conta.id === 3 ? "R$ " + parseFloat(cartoes).toFixed(2) : ''
                        )
                    })}
                    </p>
                <p className='text-gray-600 sm:text-md text-xs'>Cartão de Crédito</p>
                <AddFatura />
            </div>
            <div className='flex w-[130px] justify-between'>
            <AddIncomeModalCredito />
            <AddExpenseModalCredito />
            <SeeCreditCards />
        </div>
        </div>
        
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BsBusFrontFill size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>
                {saldo.map((conta,index) => {
                        return(
                            conta.id === 5 ? "R$ " + parseFloat(conta.valor).toFixed(2) : ''
                        )
                    })}
                </p>
                <p className='text-gray-600 sm:text-md text-xs'>Bilhete Único</p>
            </div>
            <div className='flex w-[130px] justify-between'>
            <AddIncomeModalBus />
            <AddExpenseModalBus />
        </div>
        </div>


    </div>
  )
}

export default TopCards