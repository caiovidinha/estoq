import React, { useState } from 'react'
import { Categorias } from '@/components/Categorias'

const mes = () => {

    const [items, setItems] = useState([])

    let hoje = new Date().toISOString()
    hoje = hoje.slice(5, 7)
    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'Wishlist'
    let SHEET_RANGE = 'A:B'
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
            let totals = 0
            let categorias = new Categorias()
            for (let i = 0; i < data.table.rows.length; i++) {
                let valor = data.table.rows[i].c[1].v.toFixed(2)
                totals += parseFloat(valor)
                valor = valor + ''
                valor = parseFloat(valor.replace(/[\D]+/g, ''))
                valor = valor + ''
                valor = valor.replace(/([0-9]{2})$/g, ',$1')
                
                categorias.salvar(
                    data.table.rows[i].c[0].v,
                    valor,
                )
            }
            categorias.salvar("Total",totals)
            setItems(categorias.arrayCat)
        })

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg overflow-y-auto">
                    <div className="text-center font-bold text-lg">
                        <span>Lista de Desejos</span>
                    </div>
                    <ul>
                        {items.map((item, index) => (
                            <li
                                key={index}
                                className={item.categoria=="Total" 
                                ? "bg-gray-200 rounded-lg my-3 p-3 flex justify-between items-center" 
                                : "bg-gray-50 rounded-lg my-3 p-3 flex justify-between items-center cursor-pointer"}
                            >
                                <p className='font-bold'>
                                    {item.categoria}
                                </p>
                                <p>
                                    {'R$ ' + parseFloat(item.valor).toFixed(2).replace('.',',')}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default mes
