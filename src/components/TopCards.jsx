import { React, useEffect, useState, useRef } from 'react'
import { BiLogoMastercard } from 'react-icons/bi'
import { MdRestaurantMenu } from 'react-icons/md'
import { BiSolidBank } from "react-icons/bi";
import { HiRefresh } from 'react-icons/hi';
import { TbPlugConnected } from 'react-icons/tb';
import AddIncomeModalConta from './AddIncomeModalConta'
import AddExpenseModalConta from './AddExpenseModalConta'
import AddIncomeModalCredito from './AddIncomeModalCredito'
import AddExpenseModalCredito from './AddExpenseModalCredito'
import AddIncomeModalVR from './AddIncomeModalVR'
import AddExpenseModalVR from './AddExpenseModalVR'
import SeeCreditCards from './SeeCreditCards'
import SeeAccounts from './SeeAccounts';
import AddInvestimento from './AddInvestimento';
import { useFormOptionsContext } from '@/contexts/FormOptionsContext';

const TopCards = () => {
    const [saldoGeral, setSaldoGeral] = useState('R$ 0,00')
    const [saldoVR, setSaldoVR] = useState('R$ 0,00')
    const [gastoDiarioVR, setGastoDiarioVR] = useState(null)
    const [proximoRecVR, setProximoRecVR] = useState(null)
    const [refreshing, setRefreshing] = useState(false)
    const [saldoPluggy, setSaldoPluggy] = useState(null)
    const [loadingPluggy, setLoadingPluggy] = useState(false)
    const { refetchCategorias, refetchContas, refetchCartoes, refetchCategoryIcons } = useFormOptionsContext();

    useEffect(() => {
        const fetchSaldos = async () => {
            try {
                // Busca saldo geral de API!A2
                const response = await fetch('/api/saldo')
                const data = await response.json()
                if (data.success) {
                    setSaldoGeral(data.valor)
                }

                // Busca saldo VR de API!B2
                const responseVR = await fetch('/api/saldo-vr')
                const dataVR = await responseVR.json()
                if (dataVR.success) {
                    setSaldoVR(dataVR.valor)
                    setGastoDiarioVR(dataVR.gastoDiario)
                    setProximoRecVR(dataVR.proximoRecebimento)
                }
            } catch (error) {
                console.error('Erro ao carregar saldos:', error)
            }
        }
        fetchSaldos()
    }, [])

    // Busca saldo real do Nubank via Pluggy se itemId estiver salvo
    useEffect(() => {
        const itemId = typeof window !== 'undefined' && localStorage.getItem('pluggy_item_id');
        if (!itemId) return;
        setLoadingPluggy(true);
        fetch(`/api/pluggy/saldo?itemId=${itemId}`)
            .then(r => r.json())
            .then(data => { if (data.success) setSaldoPluggy(data.saldoConta); })
            .catch(() => {})
            .finally(() => setLoadingPluggy(false));
    }, [])

    // Função para atualizar todos os dados
    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            // Recarrega saldos
            const response = await fetch('/api/saldo')
            const data = await response.json()
            if (data.success) {
                setSaldoGeral(data.valor)
            }

            const responseVR = await fetch('/api/saldo-vr')
            const dataVR = await responseVR.json()
            if (dataVR.success) {
                setSaldoVR(dataVR.valor)
                setGastoDiarioVR(dataVR.gastoDiario)
                setProximoRecVR(dataVR.proximoRecebimento)
            }

            // Recarrega dados do Context (categorias, contas, etc)
            await Promise.all([
                refetchCategorias?.(),
                refetchContas?.(),
                refetchCartoes?.(),
                refetchCategoryIcons?.()
            ])

            // Força reload da página para atualizar RecentOrders
            window.location.reload()
        } catch (error) {
            console.error('Erro ao atualizar dados:', error)
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="grid lg:grid-cols-6 gap-4 p-4">
            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <BiSolidBank size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <div className="flex items-center gap-2">
                        <p className="sm:text-2xl text-sm font-bold">
                            {saldoGeral}
                        </p>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Atualizar dados"
                        >
                            <HiRefresh 
                                size={18} 
                                className={refreshing ? 'animate-spin' : ''}
                            />
                        </button>
                    </div>
                    <p className="text-gray-600 sm:text-md text-xs">
                        Saldo em Conta
                    </p>
                    {/* Saldo real Nubank via Pluggy */}
                    {loadingPluggy && (
                        <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                            <TbPlugConnected size={12} /> buscando saldo real...
                        </p>
                    )}
                    {!loadingPluggy && saldoPluggy && (
                        <p className="text-xs text-purple-600 font-semibold mt-1 flex items-center gap-1" title="Saldo real no Nubank via Pluggy">
                            <TbPlugConnected size={12} /> {saldoPluggy} no banco
                        </p>
                    )}
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
                <div className="flex flex-col w-full pb-4 mt-2 justify-center">
                    <p className="text-gray-600 sm:text-lg text-sm font-semibold">Cartões</p>
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalCredito />
                    <AddExpenseModalCredito />
                    <SeeCreditCards />
                </div>
            </div>

            <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
                <div className="bg-gray-200 text-gray-400 h-12 p-2 mt-1 mr-4 rounded-lg flex items-center justify-center">
                    <MdRestaurantMenu size={30} />
                </div>
                <div className="flex flex-col w-full pb-4 mt-2">
                    <p className="sm:text-2xl text-sm font-bold">
                        {saldoVR}
                    </p>
                    <p className="text-gray-600 sm:text-md text-xs">
                        Vale Benefícios
                    </p>
                    {gastoDiarioVR && (
                        <p className="text-green-600 text-xs font-semibold mt-1" title={proximoRecVR ? `Próximo recebimento: ${proximoRecVR}` : ''}>
                            {gastoDiarioVR}/dia
                        </p>
                    )}
                </div>
                <div className="flex w-[130px] justify-between">
                    <AddIncomeModalVR />
                    <AddExpenseModalVR />
                </div>
            </div>
        </div>
    )
}

export default TopCards
