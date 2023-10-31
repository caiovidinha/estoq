	import {React,useState} from "react"
	import Link from "next/link"
	import { BiTransferAlt,BiSolidDashboard } from "react-icons/bi"

	const Header = () => {
		const [pagina,setPagina] = useState("dashboard")

		const dashboard = () =>{
			setPagina("dashboard")
		}
		const movimentacao = () =>{
			setPagina("movimentacao")
		}
		
		return (
			<div className="flex justify-between px-4 pt-4">
				<Link onClick={dashboard} href='/' >
                        <div className={pagina==="dashboard" ? "bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 px-10 rounded-lg inline-block" :"bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-10 rounded-lg inline-block"}>
                            <BiSolidDashboard size={25} />
                        </div>
                </Link>
				<Link href='/movimentacoes' onClick={movimentacao}>
				<div className={pagina==="movimentacao" ? "bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 px-10 rounded-lg inline-block" :"bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-10 rounded-lg inline-block"}>
                            <BiTransferAlt size={25} />
                        </div>
                </Link>
				<Link href='/movimentacoes'>
                        <div className="bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 px-10 rounded-lg inline-block">
                            <BiTransferAlt size={25} />
                        </div>
                </Link>

			</div>
		)
	}

	export default Header
