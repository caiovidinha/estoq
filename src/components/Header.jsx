import { React, useState } from 'react'
import Link from 'next/link'
import {
    BiTransferAlt,
    BiSolidDashboard,
    BiSolidBarChartAlt2,
} from 'react-icons/bi'

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

    return (
        <div>
            <div className="flex justify-between px-4 pt-4 bg-gray-100">
                <Link onClick={dashboard} href="/">
                    <div
                        className={
                            pagina === 'dashboard'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                        }
                    >
                        <BiSolidDashboard size={25} />
                    </div>
                </Link>
                <Link href="/movimentacoes" onClick={movimentacao}>
                    <div
                        className={
                            pagina === 'movimentacao'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                        }
                    >
                        <BiTransferAlt size={25} />
                    </div>
                </Link>
                <Link href="/mes" onClick={mes}>
                    <div
                        className={
                            pagina === 'mes'
                                ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                                : 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-12 sm:px-72 rounded-lg inline-block'
                        }
                    >
                        <BiSolidBarChartAlt2 size={25} />
                    </div>
                </Link>
            </div>
            <main>{children}</main>
        </div>
    )
}

export default Header
