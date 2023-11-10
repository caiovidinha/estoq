import React, { useState, useEffect } from 'react'
import { Progress } from '@nextui-org/react'
import { BsFillCalendarCheckFill } from 'react-icons/bs'
import { Balanco } from '@/components/Balanco'

const mes = () => {

    const [balanco, setBalanco] = useState([])

    let hoje = new Date().toISOString()
    hoje = hoje.slice(5, 7)
    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'Dashboard'
    let SHEET_RANGE = 'A:D'
    let FULL_URL =
        'https://docs.google.com/spreadsheets/d/' +
        SHEET_ID +
        '/gviz/tq?sheet=' +
        SHEET_TITLE +
        '&range=' +
        SHEET_RANGE

    fetch(FULL_URL)
        .then((res) => res.text())
        .then((rep) => {
            let data = JSON.parse(rep.substr(47).slice(0, -2))
            let balanco = new Balanco()
            for (let i = 0; i < data.table.rows.length; i++) {
                let valor = data.table.rows[i].c[2].v.toFixed(2)
                valor = valor + ''
                valor = parseFloat(valor.replace(/[\D]+/g, ''))
                valor = valor + ''
                valor = valor.replace(/([0-9]{2})$/g, ',$1')
                
                balanco.salvar(
                    data.table.rows[i].c[0].v,
                    data.table.rows[i].c[1].v,
                    valor,
                    data.table.rows[i].c[3].v.toFixed(2)
                )
            }
            setBalanco(balanco.arrayBal)
        })

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg overflow-y-auto">
                    <div className="text-center font-bold text-lg">
                        <span>Balanço Mensal</span>
                    </div>
                    <ul>
                        {balanco.map((bal, index) => (
                            <li
                                key={index}
                                className="bg-gray-50 hover:bg-gray-200 rounded-lg my-3 p-3 sm:p-8 grid grid-cols-2 items-center justify-between cursor-pointer"
                            >
                                <div className="w-full flex items-center justify-center sm:justify-left">
                                    <div
                                        className={
                                            bal.mes == hoje
                                                ? 'rounded-full p-3 bg-green-200 -ml-10 sm:-ml-0 mr-4 sm:mr-0'
                                                : 'rounded-full p-3 bg-blue-200 -ml-10 sm:-ml-0 mr-4 sm:mr-0'
                                        }
                                    >
                                        <BsFillCalendarCheckFill
                                            className={
                                                bal.mes == hoje
                                                    ? 'text-green-900'
                                                    : 'text-blue-900'
                                            }
                                        />
                                    </div>
                                    <p className="ml-0 sm:ml-10">
                                        {bal.mes + '/' + bal.ano}
                                    </p>
                                </div>

                                <div className="-ml-16 sm:-ml-96 flex w-64 sm:w-full">
                                    <div className="ml-8 sm:ml-10 mr-3 sm:mr-10 mt-1 sm:mt-1.5 w-24 sm:w-9/12">
                                        <Progress
                                            className="w-24 sm:w-96"
                                            color={
                                                parseFloat(bal.valor) > 1000
                                                    ? 'success'
                                                    : parseFloat(bal.valor) > 0
                                                    ? 'warning'
                                                    : 'danger'
                                            }
                                            value={(
                                                (parseFloat(bal.valor) *
                                                    100) /
                                                bal.salario
                                            ).toFixed(1)}
                                        />
                                    </div>
                                    <div
                                        className={
                                            parseFloat(bal.valor) > 1000
                                                ? 'text-green-700 font-bold'
                                                : parseFloat(bal.valor) > 0
                                                ? 'text-yellow-600 font-bold'
                                                : 'text-red-700 font-bold'
                                        }
                                    >
                                        {'R$ ' + bal.valor}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default mes
