import React from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { BsBusFrontFill } from 'react-icons/bs'
import { SiNubank } from 'react-icons/si'
import AddIncomeModalConta from './AddIncomeModalConta'
import AddExpenseModalConta from './AddExpenseModalConta'
import AddIncomeModalCredito from './AddIncomeModalCredito'
import AddExpenseModalCredito from './AddExpenseModalCredito'
import AddIncomeModalBus from './AddIncomeModalBus'
import AddExpenseModalBus from './AddExpenseModalBus'
import AddInvestimento from './AddInvestimento'
import AddFatura from './AddFatura'

const TopCards = () => {
  return (
    <div className='grid lg:grid-cols-5 gap-4 p-4'>
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <SiNubank size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600 sm:text-md text-xs'>Conta Nubank</p>
                <AddInvestimento />
            </div>
        <div className='flex w-[130px] justify-between'>
            <AddIncomeModalConta />
            <AddExpenseModalConta />
        </div>
        </div>
        
        
        <div className='bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BiLogoMastercard size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600 sm:text-md text-xs'>Crédito Nubank</p>
                <AddFatura />
            </div>
            <div className='flex w-[130px] justify-between'>
            <AddIncomeModalCredito />
            <AddExpenseModalCredito />
        </div>
        </div>
        
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BsBusFrontFill size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4 mt-2'>
                <p className='sm:text-2xl text-sm font-bold'>R$ 7.829,00</p>
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