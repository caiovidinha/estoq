import React from 'react'
import { RiMoneyDollarCircleFill, RiCandleFill } from 'react-icons/ri'
import { BiSolidDonateHeart } from 'react-icons/bi'


const TopCards = () => {
  return (
    <div className='grid lg:grid-cols-5 gap-4 p-4'>
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-14 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <RiMoneyDollarCircleFill size={40}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
                <p className='text-2xl font-bold'>R$ 7.829,00</p>
                <p className='text-gray-600'>Valor arrecadado</p>
            </div>
            <p className='bg-green-200 flex justify-center items-center p-2 rounded-lg h-6'>
               <span className='text-green-800 text-sm font-bold'>+18%</span>
            </p>
            
        </div>
        
        <div className='bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-14 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <BiSolidDonateHeart size={40}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
                <p className='text-2xl font-bold'>1.939</p>
                <p className='text-gray-600'>Doações</p>  
            </div>
            <p className='bg-red-200 flex justify-center items-center p-2 rounded-lg h-6'>
               <span className='text-red-800 text-sm font-bold'>-18%</span>
            </p>
        </div>
        
        <div className='lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg'>
            <div className='bg-gray-200 text-gray-400 h-14 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center'>
                <RiCandleFill size={40}/>
            </div>
            <div className='flex flex-col w-full pb-4'>
                <p className='text-2xl font-bold'>108</p>
                <p className='text-gray-600'>Items recebidos</p>
            </div>
            <p className='bg-green-200 flex justify-center items-center p-2 rounded-lg h-6'>
               <span className='text-green-800 text-sm font-bold'>+28%</span>
            </p>
        </div>


    </div>
  )
}

export default TopCards