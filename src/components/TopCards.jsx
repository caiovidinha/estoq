import { React, useEffect, useState, useRef } from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { BsBusFrontFill } from 'react-icons/bs'
import { SiNubank } from 'react-icons/si'
import AddIncomeModalConta from './AddIncomeModalConta'
import AddExpenseModalConta from './AddExpenseModalConta'
import AddIncomeModalCredito from './AddIncomeModalCredito'
import AddExpenseModalCredito from './AddExpenseModalCredito'
import AddIncomeModalBus from './AddIncomeModalBus'
import AddExpenseModalBus from './AddExpenseModalBus'
import SeeCreditCards from './SeeCreditCards'

const TopCards = () => {
    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'API'
    let SHEET_RANGE = 'A1:H2'

    let FULL_URL =
        'https://docs.google.com/spreadsheets/d/' +
        SHEET_ID +
        '/gviz/tq?sheet=' +
        SHEET_TITLE +
        '&range=' +
        SHEET_RANGE

    const [saldoNu, setSaldoNu] = useState([])
    const [limiteNuCaio, setLimiteNuCaio] = useState([])
    const [limiteNuJulia, setLimiteNuJulia] = useState([])
    const [limiteNeonJulia, setLimiteNeonJulia] = useState([])
    const [faturaNuCaio, setFaturaNuCaio] = useState([])
    const [faturaNuJulia, setFaturaNuJulia] = useState([])
    const [faturaNeonJulia, setFaturaNeonJulia] = useState([])
    const [saldoBU, setSaldoBU] = useState([])

    const getSaldo = () =>{
        fetch(FULL_URL)
        .then((res) => res.text())
        .then((rep) => {
            let data = JSON.parse(rep.substr(47).slice(0, -2))
            setSaldoNu(data.table.rows[0].c[0].v.toFixed(2))
            setLimiteNuCaio(data.table.rows[0].c[1].v.toFixed(2))
            setLimiteNuJulia(data.table.rows[0].c[2].v.toFixed(2))
            setLimiteNeonJulia(data.table.rows[0].c[3].v.toFixed(2))
            setFaturaNuCaio(data.table.rows[0].c[4].v.toFixed(2))
            setFaturaNuJulia(data.table.rows[0].c[5].v.toFixed(2))
            setFaturaNeonJulia(data.table.rows[0].c[6].v.toFixed(2))
            setSaldoBU(data.table.rows[0].c[7].v.toFixed(2))
        })
    }


        useEffect(() => {
            getSaldo()
        })

    return (
        <div className="grid lg:grid-cols-6 gap-4 p-4">
            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <SiNubank size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {'R$ '}
                        {parseFloat(saldoNu).toFixed(2).toString().replace('.',',')}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">
                        Conta Nubank
                    </p>
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalConta />
                    <AddExpenseModalConta />
                </div>
            </div>

            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BiLogoMastercard size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {'R$ '}
                        {(parseFloat(limiteNeonJulia) +
                            parseFloat(limiteNuJulia) +
                            parseFloat(limiteNuCaio) -
                            parseFloat(faturaNuCaio) -
                            parseFloat (faturaNeonJulia) - 
                            parseFloat (faturaNuJulia)
                            ).toFixed(2).toString().replace('.',',')}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">Crédito</p>
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalCredito />
                    <AddExpenseModalCredito />
                    <SeeCreditCards />
                </div>
            </div>

            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BsBusFrontFill size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {'R$ '}
                        {parseFloat(saldoBU).toFixed(2).toString().replace('.',',')}
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
