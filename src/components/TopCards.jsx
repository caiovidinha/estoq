import React from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { GiTakeMyMoney,GiReceiveMoney } from 'react-icons/gi'
import { BsBusFrontFill } from 'react-icons/bs'
import { SiNubank } from 'react-icons/si'
const TopCards = () => {
  return (
    <div className='grid lg:grid-cols-5 gap-4 p-4'>
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <SiNubank size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
                <p className='sm:text-2xl text-xl font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600'>Conta Nubank</p>
            </div>
        <div className='flex w-36 justify-between'>
            <button className='bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiReceiveMoney className='text-green-800' size={20}/>
            </button>
            <button className='bg-red-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiTakeMyMoney className='text-red-800' size={20}/>
            </button>
        </div>
        </div>
        
        
        <div className='bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BiLogoMastercard size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
            <p className='sm:text-2xl text-xl font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600'>Crédito Nubank</p> 
            </div>
            <div className='flex w-36 justify-between'>
            <button className='bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiReceiveMoney className='text-green-800' size={20}/>
            </button>
            <button className='bg-red-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiTakeMyMoney className='text-red-800' size={20}/>
            </button>
        </div>
        </div>
        
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BsBusFrontFill size={30}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
            <p className='sm:text-2xl text-xl font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600'>Bilhete Único</p>
            </div>
            <div className='flex w-36 justify-between'>
            <button className='bg-green-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiReceiveMoney className='text-green-800' size={20}/>
            </button>
            <button className='bg-red-200 flex justify-center items-center mt-2 rounded-full h-10 w-10'>
                <GiTakeMyMoney className='text-red-800' size={20}/>
            </button>
        </div>
        </div>


    </div>
  )
}

export default TopCards