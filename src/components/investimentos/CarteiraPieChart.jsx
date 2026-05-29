import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#7C3AED', // purple-700
  '#2563EB', // blue-600
  '#059669', // emerald-600
  '#D97706', // amber-600
  '#DC2626', // red-600
  '#0891B2', // cyan-600
  '#9333EA', // purple-500
  '#16A34A', // green-600
];

const fmt = (v) =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * CarteiraPieChart
 * @param {Object}  patrimonioPorTipo  e.g. { Ação: 80000, FII: 30000 }
 * @param {number}  total
 */
const CarteiraPieChart = ({ patrimonioPorTipo = {}, total = 0 }) => {
  const tipos = Object.keys(patrimonioPorTipo);
  const valores = tipos.map((t) => patrimonioPorTipo[t]);

  const chartData = {
    labels: tipos,
    datasets: [
      {
        data: valores,
        backgroundColor: PALETTE.slice(0, tipos.length),
        borderWidth: 2,
        borderColor: '#F3F4F6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 16 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${fmt(ctx.raw)} (${pct}%)`;
          },
        },
      },
    },
  };

  if (tipos.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum ativo na carteira
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: 260 }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default CarteiraPieChart;
