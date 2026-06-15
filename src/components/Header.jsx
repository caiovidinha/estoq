import { useState } from 'react';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { BiSolidDashboard, BiTransferAlt, BiSolidBarChartAlt2 } from 'react-icons/bi';
import { RiBillFill } from 'react-icons/ri';
import { FaChartPie } from 'react-icons/fa';
import { AiOutlineLineChart } from 'react-icons/ai';
import { BsGraphUp, BsTable } from 'react-icons/bs';
import { MdAutorenew } from 'react-icons/md';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';

const Header = ({ children }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeClass = 'bg-gray-400 hover:bg-gray-500 cursor-pointer p-3 rounded-full';
  const inactiveClass = 'bg-gray-200 hover:bg-gray-300 cursor-pointer p-3 rounded-full';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div>
      {/* Cabeçalho fixo com botão de menu para mobile */}
      <header className="flex items-center justify-between p-4 bg-gray-100">
        <div className='md:hidden'>
          <h1 className="text-xl font-bold">Controle Financeiro</h1>
        </div>
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="p-2">
            {menuOpen ? <HiX size={30} /> : <HiOutlineMenuAlt3 size={30} />}
          </button>
        </div>
      </header>

      {/* Menu retrátil para mobile */}
<nav
  className={`sm:hidden fixed top-0 left-0 h-full w-64 bg-gray-100 shadow-lg transform transition-transform duration-300 z-50 ${
    menuOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
>

  <ul className="mt-5 space-y-4 px-4">
    <li><div className='md:hidden mb-10'>
          <h1 className="text-xl font-bold">Controle Financeiro</h1>
    </div></li>
    <li onClick={() => { setMenuOpen(false); router.push('/'); }}>
      <div className={router.pathname === "/" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BiSolidDashboard size={25} />
        <span className="ml-2">Visão Geral</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/movimentacoes'); }}>
      <div className={router.pathname === "/movimentacoes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BiTransferAlt size={25} />
        <span className="ml-2">Movimentações</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/mes'); }}>
      <div className={router.pathname === "/mes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BiSolidBarChartAlt2 size={25} />
        <span className="ml-2">Balanço Mensal</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/categorias'); }}>
      <div className={router.pathname === "/categorias" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <FaChartPie size={25} />
        <span className="ml-2">Categorias</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/aPagar'); }}>
      <div className={router.pathname === "/aPagar" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <RiBillFill size={25} />
        <span className="ml-2">A pagar/A receber</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/investimentos'); }}>
      <div className={router.pathname.startsWith("/investimentos") ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BsGraphUp size={25} />
        <span className="ml-2">Investimentos</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/saldos'); }}>
      <div className={router.pathname === "/saldos" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BsTable size={25} />
        <span className="ml-2">Saldos</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/assinaturas'); }}>
      <div className={router.pathname === "/assinaturas" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <MdAutorenew size={25} />
        <span className="ml-2">Assinaturas</span>
      </div>
    </li>
    {/* <li onClick={() => { setMenuOpen(false); router.push('/estatisticas'); }}>
      <div className={router.pathname === "/estatisticas" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <AiOutlineLineChart size={25} />
        <span className="ml-2">Estatísticas</span>
      </div>
    </li> */}
  </ul>
</nav>


      {/* Menu fixo para desktop */}
      <nav className="hidden sm:grid grid-cols-8 gap-8 px-4 pt-4 bg-gray-100">
        <Link href="/">
          <div className={router.pathname === "/" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BiSolidDashboard size={25} />
            <p className="hidden sm:block font-bold">Visão Geral</p>
          </div>
        </Link>
        <Link href="/movimentacoes">
          <div className={router.pathname === "/movimentacoes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BiTransferAlt size={25} />
            <p className="hidden sm:block font-bold">Movimentações</p>
          </div>
        </Link>
        <Link href="/mes">
          <div className={router.pathname === "/mes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BiSolidBarChartAlt2 size={25} />
            <p className="hidden sm:block font-bold">Balanço Mensal</p>
          </div>
        </Link>
        <Link href="/categorias">
          <div className={router.pathname === "/categorias" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <FaChartPie size={25} />
            <p className="hidden sm:block font-bold">Categorias</p>
          </div>
        </Link>
        <Link href="/aPagar">
          <div className={router.pathname === "/aPagar" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <RiBillFill size={25} />
            <p className="hidden sm:block font-bold">A pagar/A receber</p>
          </div>
        </Link>
        <Link href="/investimentos">
          <div className={router.pathname.startsWith("/investimentos") ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BsGraphUp size={25} />
            <p className="hidden sm:block font-bold">Investimentos</p>
          </div>
        </Link>
        <Link href="/saldos">
          <div className={router.pathname === "/saldos" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BsTable size={25} />
            <p className="hidden sm:block font-bold">Saldos</p>
          </div>
        </Link>
        <Link href="/assinaturas">
          <div className={router.pathname === "/assinaturas" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <MdAutorenew size={25} />
            <p className="hidden sm:block font-bold">Assinaturas</p>
          </div>
        </Link>
        {/* <Link href="/estatisticas">
          <div className={router.pathname === "/estatisticas" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <AiOutlineLineChart size={25} />
            <p className="hidden sm:block font-bold">Estatísticas</p>
          </div>
        </Link> */}
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Header;
