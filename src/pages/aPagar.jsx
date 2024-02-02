import React, { useState, useEffect } from 'react'
import { BsThreeDots } from 'react-icons/bs'
import {
    BiRestaurant,
    BiCar,
    BiPhone,
    BiSolidTShirt,
    BiCreditCardAlt,
    BiBomb,
    BiSmile,
    BiGift,
    BiMoneyWithdraw,
} from 'react-icons/bi'
import { MdMoneyOff } from 'react-icons/md'
import { GiWeightLiftingUp, GiHealthNormal } from 'react-icons/gi'
import { SiBetfair, SiFreelancer, SiYourtraveldottv } from 'react-icons/si'
import { AiOutlineTool,AiFillCheckCircle } from 'react-icons/ai'
import { RiFundsBoxLine, RiBillLine, RiDeleteBin2Fill } from 'react-icons/ri'
import { Mov } from '@/components/Mov'
import { Modal, Button, Text, Loading } from '@nextui-org/react'

const apagar = () => {
    const [visible, setVisible] = useState(false)
    const [tipo, setTipo] = useState([])
    const [descritivo, seteDescritivo] = useState([])
    const [valor, setValor] = useState([])
    const [data, setData] = useState([])
    const [mes, setMes] = useState([])
    const [detalhes, setDetalhes] = useState([])
    const [situacao, setSituacao] = useState([])
    const [conta, setConta] = useState([])
    const [post, setPost] = useState([])
    const zap = 'https://hooks.zapier.com/hooks/catch/11052334/38vxzm2/'
    const zapDelete = 'https://hooks.zapier.com/hooks/catch/11052334/3zy3cd0/'
	const[exc,setExc] = useState(false)
	const[confirmarExc,setConfirmarExc] = useState(false)
	const[excluido,setExcluido] = useState(false)
	const[loading,setLoading] = useState(false)
    const[filterMes, setFilterMes] = useState([])
    const[filterAno, setFilterAno] = useState([])
    const[update, setUpdate] = useState(false)
    let hoje = new Date().toISOString()
    let hojeMes = hoje.slice(5, 7)
    let hojeAno = hoje.slice(0, 4)
    if(!update){
        setFilterMes(hojeMes)
        setFilterAno(hojeAno)
        setUpdate(true)
    }
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

    const handler = (
        tipo,
        descritivo,
        valor,
        data,
        mes,
        detalhes,
        situacao,
        conta
    ) => {
        setTipo(tipo)
        seteDescritivo(descritivo)
        setValor(valor)
        setData(data)
        setMes(mes)
        setDetalhes(detalhes)
        setSituacao(situacao)
        setConta(conta)
        setVisible(true)
    }

    const closeHandler = () => {
        setVisible(false)
    }

	const openConf = () =>{
		setConfirmarExc(true)
	} 

    const closeConf = () => {
        setConfirmarExc(false)
		setExcluido(false)
    }

	const confirmaExcFinal = () => {
		setExc(true)
	}

    const changeStatus = async (
        tipo,
        descritivo,
        valor,
        data,
        mes,
        detalhes,
        conta,
        index,
        id
    ) => {
        setTipo(tipo)
        seteDescritivo(descritivo)
        valor = valor.replace('.', ',')
        setValor(valor)
        setData(data)
        setMes(mes)
        setDetalhes(detalhes)
        let ident = 'status' + index
        let statusMov = document.getElementById(ident).value
        setConta(conta)
        const post = {
            tipo: tipo,
            descritivo: descritivo,
            valor: valor,
            data: data,
            mes: mes,
            detalhes: detalhes,
            situacao: statusMov,
            conta: conta,
            index: id
        }
        const res = await fetch(zap, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(post),
        })
    }

    const changeData = async () => {
        let ano = document.getElementById('ano').value
        setFilterAno(ano)
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
        setFilterMes(mes)
        
    }

    const deleteRow = async (
        id
    ) => {
        setPost({
            index: id
        })
		openConf()
	}

    const [movimentacao, setMovimentacao] = useState([])

    let SHEET_ID = '1kusPEM4OdchOyHp7Coa7MfB0Nnq3SUqWCxH0PGW5ldE'
    let SHEET_TITLE_MOV = 'Extrato'
    let SHEET_RANGE = 'A:H'
    let FULL_URL_MOV =
        'https://docs.google.com/spreadsheets/d/' +
        SHEET_ID +
        '/gviz/tq?sheet=' +
        SHEET_TITLE_MOV +
        '&range=' +
        SHEET_RANGE

    fetch(FULL_URL_MOV)
        .then((res) => res.text())
        .then((rep) => {
            let data = JSON.parse(rep.substr(47).slice(0, -2))
            let produto = new Mov()
            for (let i = 0; i < data.table.rows.length; i++) {
                let date = data.table.rows[i].c[3].v
                date = date.replace(/[^0-9,]/g, '')

                if (date[6] === ',') {
                    date = date.slice(0, 5) + '0' + date.slice(5)
                }
                let month = parseInt(date.slice(5, 7)) + 1
                if(month<10) month =  '0' + month.toString()
                let year = date.slice(0, 4)
                
                if(filterMes == month && filterAno == year)
                {
                    
                    if(data.table.rows[i].c[6].v=='A pagar' || data.table.rows[i].c[6].v=='A receber')
                {
                    produto.salvar(
                    (i+3),
                    data.table.rows[i].c[0].v,
                    data.table.rows[i].c[1].v,
                    data.table.rows[i].c[2].v.toFixed(2),
                    data.table.rows[i].c[3].v,
                    data.table.rows[i].c[4].v,
                    data.table.rows[i].c[5].v,
                    data.table.rows[i].c[6].v,
                    data.table.rows[i].c[7].v
                )}}
            }
            produto.arrayMov = produto.arrayMov.sort((a,b) => {
                let [dayA, monthA, yearA] = a.data.split('/')
                let [dayB, monthB, yearB] = b.data.split('/')
                return new Date(+yearA, +monthA - 1, +dayA) - new Date(+yearB, +monthB - 1, +dayB)
            })
            setMovimentacao(produto.arrayMov)
        })

    useEffect(() => {
        if(exc){
        fetch(zapDelete, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(post),
                })
                setExc(false)
                setLoading(true)
                setTimeout(() => {
                    setLoading(false)
                    setExcluido(true)
                }, 1000)
            }
    })
    return (
        <div className="bg-gray-100 min-h-screen">
            <title>A pagar/A receber - CF</title>
            <div className="p-4">
                <div className="w-full m-auto p-4 border rounded-lg overflow-y-auto">
                    <div className='w-full flex md:justify-end h-10 '>
                        <div className='w-[100%] md:w-[30%] md:justify-end gap-[10%] md:gap-3 flex'>
                            <select
                            id="ano"
                            key="ano"
                            className=" w-[30%] md:w-20 h-full bg-blue-800 p-1 rounded-lg hover:bg-blue-400 text-blue-200 font-semibold outline-none hover:cursor-pointer text-lg"
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
                            className="w-[60%] md:w-32 h-full bg-blue-200 p-1 rounded-lg hover:bg-blue-400 text-blue-800 outline-none font-semibold hover:cursor-pointer text-lg"
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

                        </select></div>
                    </div>
                    <div className="my-3 p-2 grid md:grid-cols-4 sm:grid-cols-3 grid-cols-3 items-center justify-between font-bold">
                        <span>Movimentação</span>
                        <span className="sm:text-left text-right">Status</span>
                        <span className="hidden md:grid">Data</span>
                        <span className="hidden sm:grid">Conta</span>
                    </div>
                    <ul>
                        {movimentacao
                            .slice(0)
                            .map((mov, index) => (
                                <li
                                    key={index}
                                    className="bg-gray-50 rounded-lg my-3 p-2 grid md:grid-cols-4 w-full sm:w-full sm:grid-cols-3 grid-cols-2 items-center justify-between cursor-pointer"
                                >
                                    <div
                                        className="flex"
                                        onClick={() =>
                                            handler(
                                                mov.tipo,
                                                mov.descritivo,
                                                mov.valor,
                                                mov.data,
                                                mov.mes,
                                                mov.detalhes,
                                                mov.situacao,
                                                mov.conta
                                            )
                                        }
                                    >
                                        <div
                                            className={
                                                mov.tipo === 'RECEITA'
                                                    ? 'bg-green-200 rounded-lg p-3'
                                                    : 'bg-red-200 rounded-lg p-3'
                                            }
                                        >
                                            {mov.descritivo ===
                                            'Alimentação' ? (
                                                <BiRestaurant
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Locomoção' ? (
                                                <BiCar
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Academia' ? (
                                                <GiWeightLiftingUp
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Celular' ? (
                                                <BiPhone
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Vestuário' ? (
                                                <BiSolidTShirt
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Cartão' ? (
                                                <BiCreditCardAlt
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Dívida' ? (
                                                <BiBomb
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Lazer' ? (
                                                <BiSmile
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Saúde' ? (
                                                <GiHealthNormal
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo === 'Bet' ? (
                                                <SiBetfair
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Presente' ? (
                                                <BiGift
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Serviços' ? (
                                                <AiOutlineTool
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Investimento' ? (
                                                <RiFundsBoxLine
                                                    size={20}
                                                    className={
                                                        mov.tipo === 'Receita'
                                                            ? 'text-green-800'
                                                            : 'text-red-800'
                                                    }
                                                />
                                            ) : mov.descritivo === 'Fatura' ? (
                                                <RiBillLine
                                                    size={20}
                                                    className="text-red-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Salário - V4' ? (
                                                <BiMoneyWithdraw
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Freelance' ? (
                                                <SiFreelancer
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : mov.descritivo ===
                                              'Limite Cartão' ? (
                                                <BiCreditCardAlt
                                                    size={20}
                                                    className="text-green-800"
                                                />
                                            ) : mov.descritivo === 'Reembolso' ? (
                                                <MdMoneyOff
                                                    size={20}
                                                    className="text-green-800"
                                                    />
                                            ) : mov.descritivo === 'Viagem' ? (
                                                <SiYourtraveldottv size={20}
                                                className="text-red-800"
                                                /> 
                                            ) 
                                            : (
                                                <BsThreeDots
                                                    size={20}
                                                    className={
                                                        mov.tipo === 'RECEITA'
                                                            ? 'text-green-800'
                                                            : 'text-red-800'
                                                    }
                                                />
                                            )}
                                        </div>
                                        <div className="pl-2 w-32">
                                            <p className="text-gray-800 font-bold text-xs">
                                                R${' '}
                                                {parseFloat(mov.valor)
                                                    .toFixed(2)
                                                    .replace('.', ',')}
                                            </p>
                                            <p className="text-gray-800 text-sm lg:hidden">
                                                {mov.detalhes.length >= 15
                                                    ? mov.detalhes.slice(
                                                          0,
                                                          13
                                                      ) + '...'
                                                    : mov.detalhes}
                                            </p>
                                            <p className="text-gray-800 text-sm hidden lg:block">
                                                {mov.detalhes}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex text-gray-600 sm:text-left text-left justify-between">
                                        <select
                                            id={'status' + index}
                                            key={index}
                                            className={
                                                mov.situacao == 'Recebido'
                                                    ? 'bg-green-200 p-1 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer'
                                                    : mov.situacao == 'Pago'
                                                    ? 'bg-red-200 p-1 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer'
                                                    : mov.situacao == 'A receber'
                                                    ? 'bg-green-200 p-1 rounded-lg hover:bg-green-400 text-green-800 font-semibold hover:cursor-pointer'
                                                    : 'bg-red-200 p-1 rounded-lg hover:bg-red-400 text-red-800 font-semibold hover:cursor-pointer'
                                            }
                                            onChange={() =>
                                                changeStatus(
                                                    mov.tipo,
                                                    mov.descritivo,
                                                    mov.valor,
                                                    mov.data,
                                                    mov.mes,
                                                    mov.detalhes,
                                                    mov.conta,
                                                    index,
                                                    mov.id
                                                )
                                            }
                                        >
                                            <option value={mov.situacao}>
                                                {mov.situacao}
                                            </option>
                                            <option
                                                value={
                                                    mov.situacao == 'Recebido'
                                                        ? 'A receber'
                                                        : mov.situacao ==
                                                          'A receber'
                                                        ? 'Recebido'
                                                        : mov.situacao == 'Pago'
                                                        ? 'A pagar'
                                                        : 'Pago'
                                                }
                                            >
                                                {mov.situacao == 'Recebido'
                                                    ? 'A receber'
                                                    : mov.situacao ==
                                                      'A receber'
                                                    ? 'Recebido'
                                                    : mov.situacao == 'Pago'
                                                    ? 'A pagar'
                                                    : 'Pago'}
                                            </option>
                                        </select>
										<div onClick={()=>deleteRow(mov.id)} className='sm:hidden bg-red-400 rounded-lg p-3 w-12 flex justify-center cursor-pointer hover:bg-red-950'>
											<RiDeleteBin2Fill className="text-black" size={20}/>
										</div>
                                    </div>
                                    <p className="hidden md:flex">{mov.data}</p>
                                    <div className="flex justify-between items-center">
                                        <p className='sm:flex hidden '>
                                            {mov.conta}
                                        </p>
										<div onClick={()=>deleteRow(mov.id)} className='bg-red-400 rounded-lg p-3 w-12 hidden sm:flex justify-center cursor-pointer hover:bg-red-950'>
											<RiDeleteBin2Fill className="text-black" size={20}/>
										</div>
                                    </div>

                                </li>
                            ))}
                    </ul>
                </div>
            </div>
            <div>
                <Modal
                    closeButton
                    aria-labelledby="modal-title"
                    open={visible}
                    onClose={closeHandler}
                >
                    <Modal.Header>
                        <Text id="modal-title" size={18}>
                            <Text b size={18}>
                                Movimentação: {tipo}
                            </Text>
                        </Text>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="descritivo">
                                <Text b size={18}>
                                    Categoria:
                                </Text>
                                {' ' + descritivo}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="valor">
                                <Text b size={18}>
                                    Valor:
                                </Text>
                                {' ' + valor}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="data">
                                <Text b size={18}>
                                    Data:
                                </Text>
                                {' ' + data}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="mes">
                                <Text b size={18}>
                                    Mês/Fatura:
                                </Text>
                                {' ' + mes}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="detalhes">
                                <Text b size={18}>
                                    Detalhes:
                                </Text>
                                {' ' + detalhes}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="situacao">
                                <Text b size={18}>
                                    Situação:
                                </Text>
                                {' ' + situacao}
                            </Text>
                        </div>

                        <div className="bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text id="conta">
                                <Text b size={18}>
                                    Conta:
                                </Text>
                                {' ' + conta}
                            </Text>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button auto flat color="error" onPress={closeHandler}>
                            Fechar
                        </Button>
                    </Modal.Footer>
                </Modal>
				<Modal
                    closeButton
                    aria-labelledby="modal-title"
                    open={confirmarExc}
                    onClose={closeConf}
                >
                    <Modal.Header>
                        <Text id="modal-title" size={18}>
                            <Text b size={18}>
								{excluido ? 'Feito!' : loading ? 'Excluindo...' : 'Tem certeza?'}
                            </Text>
                        </Text>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <div className="text-center bg-gray-100 rounded-lg -my-1 p-3 grid">
                            <Text>
							{excluido ? 'Movimentação excluída com sucesso!' : loading ? 'Por favor, aguarde...' : 'Deseja excluir a movimentação do histórico? Isso irá afetar todos valores que utilizavam essa informação!'}
                            </Text>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
						<Button auto flat color="success" onPress={excluido ? closeConf : confirmaExcFinal}>
                        {excluido ? (
                            <AiFillCheckCircle size={20} />
                        ) : loading ? (
                            <Loading type="spinner" color="white" size="sm" />
                        ) : (
                            'Ok!'
                        )}
                        </Button>
                        <Button auto flat color="error" onPress={closeConf}>
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

export default apagar