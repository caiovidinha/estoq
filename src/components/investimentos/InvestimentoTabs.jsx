import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MdDashboard, MdAccountBalance } from 'react-icons/md';
import { TbChartCandle, TbReplace, TbFlame } from 'react-icons/tb';

const TABS = [
  { href: '/investimentos', label: 'Dashboard', icon: MdDashboard, phase: 1 },
  { href: '/investimentos/carteira', label: 'Carteira', icon: MdAccountBalance, phase: 1 },
  { href: '/investimentos/valuation', label: 'Valuation', icon: TbChartCandle, phase: 2 },
  { href: '/investimentos/rebalanceamento', label: 'Rebalanceamento', icon: TbReplace, phase: 3 },
  { href: '/investimentos/simulador', label: 'Simulador FIRE', icon: TbFlame, phase: 3 },
];

const InvestimentoTabs = () => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-4">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = router.pathname === tab.href;
        const disabled = false;

        if (disabled) {
          return (
            <div
              key={tab.href}
              title={`Em breve — Fase ${tab.phase}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                         bg-gray-100 text-gray-400 cursor-not-allowed select-none"
            >
              <Icon size={15} />
              {tab.label}
            </div>
          );
        }

        return (
          <Link key={tab.href} href={tab.href}>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                          cursor-pointer transition-colors
                          ${active
                            ? 'bg-purple-800 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
            >
              <Icon size={15} />
              {tab.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default InvestimentoTabs;
