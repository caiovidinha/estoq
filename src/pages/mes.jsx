import React, { useState, useEffect } from 'react'
import { Progress } from '@nextui-org/react'
import { BsCreditCardFill } from 'react-icons/bs'
import { Balanco } from '@/components/Balanco'

const mes = () => {
    // const [visible, setVisible] = useState(false)
    // const [tipo, setTipo] = useState([])
    // const [descritivo, seteDescritivo] = useState([])
    // const [valor, setValor] = useState([])
    // const [data, setData] = useState([])
    // const [mes, setMes] = useState([])
    // const [detalhes, setDetalhes] = useState([])
    // const [situacao, setSituacao] = useState([])
    // const [conta, setConta] = useState([])

    // const handler = (tipo,descritivo,valor,data,mes,detalhes,situacao,conta) => {
    // 	setTipo(tipo)
    // 	seteDescritivo(descritivo)
    // 	setValor(valor)
    // 	setData(data)
    // 	setMes(mes)
    // 	setDetalhes(detalhes)
    // 	setSituacao(situacao)
    // 	setConta(conta)
    // 	setVisible(true)
    // }

    // const closeHandler = () => {
    //   setVisible(false)
    // }

    const [balanco, setBalanco] = useState([])

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'Dashboard'
    let SHEET_RANGE = 'A:C'
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
                balanco.salvar(
                    data.table.rows[i].c[0].v,
                    data.table.rows[i].c[1].v,
                    data.table.rows[i].c[2].v.toFixed(2)
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
                        {balanco
                            .slice(0)
                            .reverse()
                            .map((bal, index) => (
                                <li
                                    key={index}
                                    className="bg-gray-50 hover:bg-gray-100 rounded-lg my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="rounded-full p-3 bg-blue-200">
                                            <BsCreditCardFill className="text-blue-900" />
                                        </div>
                                        {bal.mes + '/' + bal.ano}
                                    </div>
                                    <div>
                                        <div className="w-28">
                                            <Progress
                                                color="secondary"
                                                value={(
                                                    ((3800 - bal.valor) * 100) /
                                                    3800
                                                ).toFixed(1)}
                                            />
                                        </div>
                                        <p className="text-right text-xs text-gray-400 w-32">
                                            R$ {bal.valor} / R$ 3800.00
                                        </p>
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
