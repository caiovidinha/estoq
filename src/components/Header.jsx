import { useState } from 'react';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { BiSolidDashboard, BiTransferAlt, BiSolidBarChartAlt2 } from 'react-icons/bi';
import { RiBillFill } from 'react-icons/ri';
import { FaChartPie } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { FaChartLine } from 'react-icons/fa';


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
          <h1 className="text-xl font-bold">Controle Finaneiro</h1>
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
          <h1 className="text-xl font-bold">Controle Finaneiro</h1>
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
    <li onClick={() => { setMenuOpen(false); router.push('/categorias'); }}>
      <div className={router.pathname === "/categorias" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <FaChartPie size={25} />
        <span className="ml-2">Categorias</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/mes'); }}>
      <div className={router.pathname === "/mes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <BiSolidBarChartAlt2 size={25} />
        <span className="ml-2">Balanço Mensal</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/aPagar'); }}>
      <div className={router.pathname === "/aPagar" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <RiBillFill size={25} />
        <span className="ml-2">A pagar/A receber</span>
      </div>
    </li>
    <li onClick={() => { setMenuOpen(false); router.push('/graficos'); }}>
      <div className={router.pathname === "/graficos" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
        <FaChartLine size={25} />
        <span className="ml-2">Gráficos</span>
      </div>
    </li>
  </ul>
</nav>


      {/* Menu fixo para desktop */}
      <nav className="hidden sm:grid grid-cols-6 gap-8 px-4 pt-4 bg-gray-100">
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
        <Link href="/categorias">
          <div className={router.pathname === "/categorias" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <FaChartPie size={25} />
            <p className="hidden sm:block font-bold">Categorias</p>
          </div>
        </Link>
        <Link href="/mes">
          <div className={router.pathname === "/mes" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <BiSolidBarChartAlt2 size={25} />
            <p className="hidden sm:block font-bold">Balanço Mensal</p>
          </div>
        </Link>
        <Link href="/aPagar">
          <div className={router.pathname === "/aPagar" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <RiBillFill size={25} />
            <p className="hidden sm:block font-bold">A pagar/A receber</p>
          </div>
        </Link>
        <Link href="/graficos">
          <div className={router.pathname === "/graficos" ? activeClass + " flex flex-row items-center justify-center gap-3" : inactiveClass + " flex flex-row items-center justify-center gap-3"}>
            <FaChartLine size={25} />
            <p className="hidden sm:block font-bold">Gráficos</p>
          </div>
        </Link>
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Header;
