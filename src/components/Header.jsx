import { React, useState } from 'react'
import Link from 'next/link'
import {
    BiTransferAlt,
    BiSolidDashboard,
    BiSolidBarChartAlt2,
} from 'react-icons/bi'
import { BsBagHeartFill  } from 'react-icons/bs'
import { FaChartPie  } from 'react-icons/fa'
 
const Header = ({ children }) => {
    const [pagina, setPagina] = useState('dashboard')

    const dashboard = () => {
        setPagina('dashboard')
    }

    const movimentacao = () => {
        setPagina('movimentacao')
    }

    const mes = () => {
        setPagina('mes')
    }

    const categorias = () => {
        setPagina('categorias')
    }

    const wishlist = () => {
        setPagina('wishlist')
    }

    return (
        <div>
            <div className="grid grid-cols-5 gap-8 px-4 pt-4 bg-gray-100">
                <Link className='inline-block rounded-full' onClick={dashboard} href="/">
                    <div
                        className={
                            pagina === 'dashboard'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                        }
                    >
                        <BiSolidDashboard className={'sm:mr-2'} size={25} />
                        <p className='hidden sm:block font-bold'>Visão Geral</p>
                    </div>
                </Link>

                <Link className='inline-block rounded-full' href="/movimentacoes" onClick={movimentacao}>
                    <div
                        className={
                            pagina === 'movimentacao'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                        }
                    >
                        <BiTransferAlt className={'sm:mr-2'} size={25} />
                        <p className='hidden sm:block font-bold'>Movimentações</p>
                    </div>
                </Link>

                <Link className='inline-block rounded-full' href="/categorias" onClick={categorias}>
                    <div
                        className={
                            pagina === 'categorias'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                        }
                    >
                        <FaChartPie className={'sm:mr-2'} size={25} />
                        <p className='hidden sm:block font-bold'>Categorias</p>
                    </div>
                </Link>

                <Link className='inline-block rounded-full' href="/mes" onClick={mes}>
                    <div
                        className={
                            pagina === 'mes'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                        }
                    >
                        <BiSolidBarChartAlt2 className={'sm:mr-2'} size={25} />
                        <p className='hidden sm:block font-bold'>Balanço Mensal</p>
                    </div>
                </Link>

                <Link className='inline-block rounded-full' href="/wishlist" onClick={wishlist}>
                    <div
                        className={
                            pagina === 'wishlist'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full sm:rounded-lg sm:w-full inline-block sm:flex sm:justify-center'
                        }
                    >
                        <BsBagHeartFill className={'sm:mr-2'} size={25} />
                        <p className='hidden sm:block font-bold'>Lista de desejos</p>
                    </div>
                </Link>

            </div>
            <main>{children}</main>
        </div>
    )
}

export default Header
