import React, { useState, useEffect, useMemo } from 'react'
import { Progress, Popover, Dropdown} from '@nextui-org/react'
import { BsFillCalendarCheckFill } from 'react-icons/bs'
import { BsThreeDots } from 'react-icons/bs'
import {
    BiRestaurant,
    BiCar,
    BiPhone,
    BiSolidTShirt,
    BiBomb,
    BiSmile,
    BiGift,
    BiMoneyWithdraw,
} from 'react-icons/bi'
import { MdMoneyOff } from 'react-icons/md'
import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi'
import { SiBetfair, SiFreelancer, SiYourtraveldottv  } from 'react-icons/si'
import { AiOutlineTool,AiFillCheckCircle } from 'react-icons/ai'
import { RiFundsBoxLine, RiBillLine, RiDeleteBin2Fill } from 'react-icons/ri'
import { Categorias } from '@/components/categorias'

const categorias = () => {

    const [categorias, setCategorias] = useState([])
    const [total, setTotal] = useState([])


    let zapier = 'https://hooks.zapier.com/hooks/catch/11052334/3kuysos/'
    let hoje = new Date().toISOString()
    let hojeMes = hoje.slice(5, 7)
    let hojeAno = hoje.slice(0, 4)
    switch(hojeMes){
        case "01":
            hojeMes = 'Janeiro'
            break
        case "02":
            hojeMes = 'Fevereiro'
            break
        case "03":
            hojeMes = 'Março'
            break
        case "04":
            hojeMes = 'Abril'
            break
        case "05":
            hojeMes = 'Maio'
            break
        case "06":
            hojeMes = 'Junho'
            break
        case "07":
            hojeMes = 'Julho'
            break
        case "08":
            hojeMes = 'Agosto'
            break
        case "09":
            hojeMes = 'Setembro'
            break  
        case "10":
            hojeMes = 'Outubro'
            break  
        case "11":
            hojeMes = 'Novembro'
            break  
        case "12":
            hojeMes = 'Dezembro'
            break                                                               
    }

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE = 'Categorias'
    let SHEET_RANGE = 'A2:B'
    let FULL_URL =
        'https://docs.google.com/spreadsheets/d/' +
        SHEET_ID +
        '/gviz/tq?sheet=' +
        SHEET_TITLE +
        '&range=' +
        SHEET_RANGE

    const changeData = async () => {
        let ano = document.getElementById('ano').value
        let mes = document.getElementById('mes').value
        switch(mes){
            case "Janeiro":
                mes = '01'
                break
            case "Fevereiro":
                mes = '02'
                break
            case "Março":
                mes = '03'
                break
            case "Abril":
                mes = '04'
                break
            case "Maio":
                mes = '05'
                break
            case "Junho":
                mes = '06'
                break
            case "Julho":
                mes = '07'
                break
            case "Agosto":
                mes = '08'
                break
            case "Setembro":
                mes = '09'
                break  
            case "Outubro":
                mes = '10'
                break  
            case "Novembro":
                mes = '11'
                break  
            case "Dezembro":
                mes = '12'
                break                                                               
        }
        const post = {
            data: mes + '/' + ano
        }
        const res = await fetch(zapier, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        })
    }
    
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
        setTotal(totals)
        setCategorias(categorias.arrayCat)
    })

    useEffect(() => {
        changeData();
      },[]);


    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg overflow-y-auto">
                    <div className="grid grid-cols-3 font-bold text-lg">
                        <span>Categorias</span>
                        <select
                            id="ano"
                            key="ano"
                            className="ml-3 w-20 bg-blue-800 p-1 rounded-lg hover:bg-blue-400 text-blue-200 font-semibold outline-none hover:cursor-pointer"
                            onChange={changeData}
                            defaultValue={hojeAno}
                        >
                            <option key="2023">
                                2023
                            </option>
                            <option key="2024">
                                2024
                            </option>
                            

                        </select>

                        <select
                            id="mes"
                            key="mes"
                            className="w-32 -ml-3 bg-blue-200 p-1 rounded-lg hover:bg-blue-400 text-blue-800 outline-none font-semibold hover:cursor-pointer"
                            onChange={changeData}
                            defaultValue={hojeMes}
                        >
                            <option value="Janeiro">
                                Janeiro
                            </option>
                            <option value="Fevereiro">
                                Fevereiro
                            </option>
                            <option value="Março">
                                Março
                            </option>
                            <option value="Abril">
                                Abril
                            </option>
                            <option value="Maio">
                                Maio
                            </option>
                            <option value="Junho">
                                Junho
                            </option>
                            <option value="Julho">
                                Julho
                            </option>
                            <option value="Agosto">
                                Agosto
                            </option>
                            <option value="Setembro">
                                Setembro
                            </option>
                            <option value="Outubro">
                                Outubro
                            </option>
                            <option  value="Novembro">
                                Novembro
                            </option>
                            <option value="Dezembro">
                                Dezembro
                            </option>

                        </select>
                          </div>
                    <ul>
                        {categorias.map((cat, index) => (
                            <li
                                key={index}
                                className="bg-gray-50 rounded-lg my-3 p-3 sm:p-8 grid grid-cols-2 items-center justify-between cursor-pointer"
                            >
                                <div className="w-full grid grid-cols-3">
                                <Popover placement="bottom" showArrow={true}>
                                    <Popover.Trigger>
                                    <div
                                    className='rounded-full p-3 bg-blue-200 mr-16 inline-block w-11 ml-6'
                                    >
                                        {cat.categoria ===
                                            'Alimentação' ? (
                                                <BiRestaurant
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Locomoção' ? (
                                                <BiCar
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Academia' ? (
                                                <GiWeightLiftingUp
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Celular' ? (
                                                <BiPhone
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Vestuário' ? (
                                                <BiSolidTShirt
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Cartão' ? (
                                                <BiCblueitCardAlt
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Dívida' ? (
                                                <BiBomb
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Lazer' ? (
                                                <BiSmile
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Saúde' ? (
                                                <GiHealthNormal
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria === 'Bet' ? (
                                                <SiBetfair
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Presente' ? (
                                                <BiGift
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Serviços' ? (
                                                <AiOutlineTool
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Investimento' ? (
                                                <RiFundsBoxLine
                                                    size={20}
                                                    className={
                                                        cat.tipo === 'Receita'
                                                            ? 'text-green-800'
                                                            : 'text-blue-800'
                                                    }
                                                />
                                            ) : cat.categoria === 'Fatura' ? (
                                                <RiBillLine
                                                    size={20}
                                                    className="text-blue-800"
                                                />
                                            ) : cat.categoria ===
                                              'Salário - V4' ? (
                                                <BiMoneyWithdraw
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : cat.categoria ===
                                              'Freelance' ? (
                                                <SiFreelancer
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : cat.categoria ===
                                              'Limite Cartão' ? (
                                                <BiCblueitCardAlt
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : cat.categoria === 'Reembolso' ? (
                                                <MdMoneyOff
                                                    size={20}
                                                    className="text-green-800"
                                                    />
                                            ) : cat.categoria === 'Viagem' ? (
                                                <SiYourtraveldottv size={20}
                                                className="text-blue-800"
                                                /> 
                                            ) 
                                            : (
                                                <BsThreeDots
                                                    size={20}
                                                    className={
                                                        cat.tipo === 'RECEITA'
                                                            ? 'text-green-800'
                                                            : 'text-blue-800'
                                                    }
                                                />
                                            )}
                                        
                                    </div>
                                    </Popover.Trigger>
                                    <Popover.Content>
                                        <div className="text-small font-bold p-4">{cat.categoria}</div>
                                    </Popover.Content>
                                    </Popover>
    
                                </div>
                           

                                <div className="-ml-16 sm:-ml-96 flex w-64 sm:w-full">
                                    <div className="sm:ml-10 mr-3 sm:mr-10 mt-1 sm:mt-1.5 w-24 sm:w-9/12">
                                        <Progress
                                            className="w-full sm:w-96"
                                            color={'primary'}
                                            value={(
                                                (parseFloat(cat.valor) *
                                                    100) /
                                                    parseFloat(total)
                                            ).toFixed(1)}
                                        />
                                    </div>
                                    <div
                                        className='text-blue-700 font-bold'
                                    >
                                        {'R$ ' + cat.valor}
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

export default categorias
