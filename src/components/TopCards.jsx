import { React, useEffect, useState, useRef } from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { BsBusFrontFill } from 'react-icons/bs'
import { BiSolidBank } from "react-icons/bi";
import AddIncomeModalConta from './AddIncomeModalConta'
import AddExpenseModalConta from './AddExpenseModalConta'
import AddIncomeModalCredito from './AddIncomeModalCredito'
import AddExpenseModalCredito from './AddExpenseModalCredito'
import AddIncomeModalBus from './AddIncomeModalBus'
import AddExpenseModalBus from './AddExpenseModalBus'
import SeeCreditCards from './SeeCreditCards'
import SeeAccounts from './SeeAccounts';
import AddInvestimento from './AddInvestimento';

const TopCards = () => {
    const [saldoGeral, setSaldoGeral] = useState('R$ 0,00')
    const [saldoBU, setSaldoBU] = useState('R$ 0,00')

    useEffect(() => {
        const fetchSaldos = async () => {
            try {
                // Busca saldo geral de API!A2
                const response = await fetch('/api/saldo')
                const data = await response.json()
                
                if (data.success) {
                    setSaldoGeral(data.valor)
                }
            } catch (error) {
                console.error('Erro ao carregar saldos:', error)
            }
        }
        fetchSaldos()
    }, [])

    return (
        <div className="grid lg:grid-cols-6 gap-4 p-4">
            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BiSolidBank size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {saldoGeral}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">
                        Saldo em Conta
                    </p>
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalConta />
                    <AddExpenseModalConta />
                    <SeeAccounts />
                </div>
            </div>

            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BiLogoMastercard size={30} />
                </div>
                {/* TODO: Reimplementar valores de crédito usando endpoint da API REST
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {'R$ '}
                        {(
                            Number(limiteNeonJulia || 0) +
                            Number(limiteNuJulia || 0) +
                            Number(limitePicPayCaio || 0) +
                            Number(limiteNuCaio || 0) -
                            Number(faturaNuCaio || 0) -
                            Number(faturaNeonJulia || 0) - 
                            Number(faturaPicPayCaio || 0) - 
                            Number(faturaNuJulia || 0)
                        ).toFixed(2).replace('.',',')}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">Crédito</p>
                </div>
                */}
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="text-gray-600 sm:text-md text-xs">Crédito</p>
                </div>
                <div className="flex w-[90px] justify-between">
                    <AddIncomeModalCredito />
                    <AddExpenseModalCredito />
                    {/* TODO: Descomentar quando houver endpoint de saldos de cartões
                    <SeeCreditCards />
                    */}
                </div>
            </div>

            <div className="hidden lg:flex lg:col-span-2 col-span-1 bg-white justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BsBusFrontFill size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {saldoBU}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">
                        Bilhete Único
                    </p>
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalBus />
                    <AddExpenseModalBus />
                </div>
            </div>
        </div>
    )
}

export default TopCards
